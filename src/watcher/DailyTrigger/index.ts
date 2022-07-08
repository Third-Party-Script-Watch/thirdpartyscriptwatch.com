import { AzureFunction, Context } from '@azure/functions';
import { MongoClient } from 'mongodb';
import * as zlib from 'zlib';
import axios from 'axios';

import * as scripts from './scripts.json';
import { Script, ScriptMetric } from './models';

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
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  if (!connectionString || connectionString === '') {
    throw new Error('MONGODB_CONNECTION_STRING not defined');
  }

  const client = new MongoClient(connectionString);

  const metrics: ScriptMetric[] = [];

  const runTimestamp = new Date();
  runTimestamp.setHours(0);
  runTimestamp.setMinutes(0);
  runTimestamp.setSeconds(0);
  runTimestamp.setMilliseconds(0);

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
        name: scripts[i].name,
        url: scripts[i].url,
      });

      if (!result.acknowledged) {
        throw new Error(`Error inserting new script ${scripts[i].id}`);
      }
      script = await scriptsCollection.findOne<Script>({ id: scripts[i].id });
    }

    const response = await axios.get(scripts[i].url, {
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
      retrieved: runTimestamp,
      contentType: headers['content-type'],
      contentEncoding: headers['content-encoding'],
      contentLength: parseInt(headers['content-length'], 10),
      contentLengthUncompressed: content.length,
    });
  }

  const result = await metricsCollection.insertMany(metrics);
  if (result.acknowledged) {
    console.log(`Inserted ${result.insertedCount} metrics`);
  } else {
    throw new Error('Error inserting metrics');
  }

  // TODO: Grab metrics for last 30 days & output JSON file to blob storage:
  // context.bindings.dataOutput = '{"message":"yolo"}';
};

export default timerTrigger;
