import { AzureFunction, Context } from '@azure/functions';
import { MongoClient } from 'mongodb';

import * as scripts from './scripts.json';
import { Script, ScriptMetric } from './models';
import { launch } from 'puppeteer';

const timerTrigger: AzureFunction = async function (
  context: Context,
  timer: any
): Promise<void> {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  if (!connectionString || connectionString === '') {
    throw new Error('MONGODB_CONNECTION_STRING not defined');
  }

  const client = new MongoClient(connectionString);

  const metrics = await getMetrics();

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
          x.scriptId = undefined;
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
  const page = await context.newPage();
  await page.setCacheEnabled(false);

  const retrieved = new Date();
  retrieved.setHours(0);
  retrieved.setMinutes(0);
  retrieved.setSeconds(0);
  retrieved.setMilliseconds(0);

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];

    page.on('requestfinished', async (req) => {
      const response = req.response();
      if (response !== null) {
        const headers = response.headers();
        const content = await response.buffer();

        metrics.push({
          scriptId: script.id,
          retrieved,
          url: response.url(),
          isInitialRequest: response.url() === script.url,
          contentType: headers['content-type'],
          contentEncoding: headers['content-encoding'],
          contentLength: parseInt(headers['content-length'], 10),
          contentLengthUncompressed: content.byteLength,
        });
      }
    });

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

  await browser.close();

  return metrics;
}

export default timerTrigger;
