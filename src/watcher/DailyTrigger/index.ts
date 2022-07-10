import { AzureFunction, Context } from '@azure/functions';
import { MongoClient } from 'mongodb';
import { launch } from 'puppeteer';
import * as hpack from 'hpack';

import * as scripts from './scripts.json';
import { Script, ScriptMetric } from './models';

const timerTrigger: AzureFunction = async function (
  context: Context,
  timer: any
): Promise<void> {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  if (!connectionString || connectionString === '') {
    throw new Error('MONGODB_CONNECTION_STRING not defined');
  }

  scripts.push({
    id: '__inception',
    name: 'TPSW',
    url: 'https://thirdpartyscriptwatch.com/',
    initialisationHtml: '',
  });

  const metrics = await getMetrics();

  const client = new MongoClient(connectionString);
  try {
    const database = client.db(process.env.MONGODB_DATABASE || 'tpsw');
    const scriptsCollection = database.collection('scripts');
    const metricsCollection = database.collection('script-metrics');

    for (let i = 0; i < scripts.length; i++) {
      // Check if script exists in DB, add if not
      let script = await scriptsCollection.findOne<Script>({
        id: scripts[i].id,
      });
      if (script === null) {
        const result = await scriptsCollection.insertOne({
          id: scripts[i].id,
          name: scripts[i].name,
          url: scripts[i].url,
        });

        if (!result.acknowledged) {
          throw new Error(`Error inserting new script ${scripts[i].id}`);
        }
        script = await scriptsCollection.findOne<Script>({ id: scripts[i].id });
      }

      // Link metrics to script
      metrics
        .filter((x) => x.scriptId === script.id)
        .forEach((x) => {
          x.script = script._id;
          delete x.scriptId;
        });
    }

    const result = await metricsCollection.insertMany(metrics);
    if (result.acknowledged) {
      console.log(`Inserted ${result.insertedCount} metrics`);
    } else {
      throw new Error('Error inserting metrics');
    }

    // Grab metrics for last 30 days & output JSON file to blob storage
    const metricsLast30Data = [];

    const existingScripts = await scriptsCollection.find<Script>({}).toArray();

    const scriptMetricsLimit = new Date();
    scriptMetricsLimit.setDate(scriptMetricsLimit.getDate() - 30);
    const scriptMetricsPast30Days = await metricsCollection
      .find<ScriptMetric>({
        retrieved: { $gt: scriptMetricsLimit },
      })
      .toArray();

    existingScripts.forEach((script) => {
      script.metrics = scriptMetricsPast30Days
        .filter((x) => x.script.equals(script._id))
        .map((x) => ({
          ...x,
          _id: undefined,
          script: undefined,
        }))
        .sort((a: any, b: any) => {
          if (a.retrieved.getTime() > b.retrieved.getTime()) {
            return 1;
          }
          if (a.retrieved.getTime() < b.retrieved.getTime()) {
            return -1;
          }
          return -1;
        });

      metricsLast30Data.push({ ...script, _id: undefined });
    });

    context.bindings.dataOutput = JSON.stringify(metricsLast30Data);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

async function getMetrics(): Promise<ScriptMetric[]> {
  const metrics = [];

  const browser = await launch();
  const context = await browser.createIncognitoBrowserContext();

  const retrieved = new Date();
  retrieved.setHours(0);
  retrieved.setMinutes(0);
  retrieved.setSeconds(0);
  retrieved.setMilliseconds(0);

  for (let i = 0; i < scripts.length; i++) {
    const page = await context.newPage();
    await page.setCacheEnabled(false);

    const cdpSession = await page.target().createCDPSession();
    await cdpSession.send('Network.enable');

    const script = scripts[i];

    const responseMetrics: Record<string, ScriptMetric> = {};

    cdpSession.on('Network.responseReceived', (e) => {
      const headersSize = getHeadersSize(e.response);
      responseMetrics[e.requestId] = {
        scriptId: script.id,
        retrieved,
        url: e.response.url,
        isInitialRequest: script.url.startsWith(e.response.url),
        contentType: e.response.headers['content-type'],
        contentEncoding: e.response.headers['content-encoding'],
        contentLength: headersSize,
        contentLengthUncompressed: headersSize,
      };
    });

    cdpSession.on('Network.dataReceived', (e) => {
      responseMetrics[e.requestId].contentLengthUncompressed += e.dataLength;
    });

    cdpSession.on('Network.loadingFinished', (e) => {
      responseMetrics[e.requestId].contentLength += e.encodedDataLength;

      metrics.push(responseMetrics[e.requestId]);
    });

    if (script.id === '__inception') {
      await page.goto(script.url, { waitUntil: 'networkidle0' });
    } else {
      await page.setContent(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>${script.name}</title>
        </head>
        <body>
            <h1>${script.name}</h1>
            <p>ID: ${script.id}</p>
            ${script.initialisationHtml}
        </body>
        </html>`,
        { waitUntil: 'networkidle0' }
      );
    }
  }

  await browser.close();

  return metrics;
}

function getHeadersSize(response): number {
  if (response.headersText !== undefined) {
    return response.headersText.length;
  }

  const headers = Object.keys(response.headers).map((x) => [
    x,
    response.headers[x],
  ]);
  const codec = new hpack();
  const encoded = codec.encode(headers);

  return encoded.byteLength;
}

export default timerTrigger;
