import { AzureFunction, Context } from '@azure/functions';
import { MongoClient, ObjectId } from 'mongodb';
import { launch } from 'puppeteer';
import axios from 'axios';
import * as zlib from 'zlib';

import * as scripts from './scripts.json';

type Script = {
  _id?: ObjectId;
  id: string;
  name: string;
  url: string;
  metrics?: ScriptMetric[];
};

type ScriptMetric = {
  script?: ObjectId;
  ts: Date;
  sz: number;
  su: number;
};

const decodeBody = async function (
  body: zlib.BrotliDecompress | zlib.Gunzip | zlib.Deflate
): Promise<string> {
  return new Promise((resolve, reject) => {
    let bodyString = '';
    body.on('data', (x) => (bodyString += x));
    body.on('end', () => {
      resolve(bodyString);
    });
    body.on('error', (e) => {
      reject(e);
    });
    body.read();
  });
};

const timerTrigger: AzureFunction = async function (
  context: Context,
  timer: any
): Promise<void> {
  const method = 'fetch'; // fetch | intercept

  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  if (!connectionString || connectionString === '') {
    throw new Error('MONGODB_CONNECTION_STRING not defined');
  }

  const client = new MongoClient(connectionString);

  const metrics = [];

  const runTimestamp = new Date();
  runTimestamp.setHours(0);
  runTimestamp.setMinutes(0);
  runTimestamp.setSeconds(0);
  runTimestamp.setMilliseconds(0);

  if (method === 'fetch') {
    // TODO: Get DB name from env so we can run separate staging DB
    const database = client.db('tpsw');
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
          name: scripts[i].displayName,
          url: scripts[i].scriptUrl,
        });

        if (!result.acknowledged) {
          throw new Error(`Error inserting new script ${scripts[i].id}`);
        }
        script = await scriptsCollection.findOne<Script>({ id: scripts[i].id });
      }

      const response = await axios.get(scripts[i].scriptUrl, {
        // Workaround to support Brotli:
        // https://github.com/axios/axios/issues/1635#issuecomment-603258750
        headers: {
          'accept-encoding': 'br, gzip, deflate',
        },
        decompress: false,
        responseType: 'stream',
        // if you want to enhance the default transformResponse, instead of replacing,
        // use an array to contain both the default and the customized
        transformResponse(data) {
          if (data.headers['content-encoding'] === 'br') {
            return data.pipe(zlib.createBrotliDecompress());
          }
          if (data.headers['content-encoding'] === 'gzip') {
            return data.pipe(zlib.createGunzip());
          }
          if (data.headers['content-encoding'] === 'deflate') {
            return data.pipe(zlib.createDeflate());
          }

          return data;
        },
      });

      const headers = response.headers;
      const content = await decodeBody(response.data);

      metrics.push({
        script: script._id,
        ts: runTimestamp,
        sz: parseInt(headers['content-length'], 10),
        su: content.length,
        // contentLength: parseInt(headers['content-length'], 10),
        // contentEncoding: headers['content-encoding'],
        // contentType: headers['content-type'],
        // contentLengthDecoded: content.length,
      });
    }

    const result = await metricsCollection.insertMany(metrics);
    if (result.acknowledged) {
      console.log(`Inserted ${result.insertedCount} metrics`);
    } else {
      throw new Error('Error inserting metrics');
    }
  } else {
    const browser = await launch();
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('requestfinished', async (req) => {
      const response = req.response();
      if (response !== null) {
        const headers = response.headers();
        const content = await response.buffer();
        metrics.push({
          url: response.url(),
          responseLength: parseInt(headers['content-length'], 10),
          responseEncoding: headers['content-encoding'],
          responseType: headers['content-type'],
          contentByteLength: content.byteLength,
        });
      }
    });
    await page.on('request', (request) => {
      request.continue();
    });

    for (let i = 0; i < scripts.length; i++) {
      await page.setContent(
        `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${scripts[i].displayName}</title>
    </head>
    <body>
        <h1>${scripts[i].displayName}</h1>
        <p>ID: ${scripts[i].id}</p>
        ${scripts[i].initialisationHtml}
    </body>
    </html>`,
        { waitUntil: 'networkidle0' }
      );
    }
    await browser.close();
  }
};

export default timerTrigger;
