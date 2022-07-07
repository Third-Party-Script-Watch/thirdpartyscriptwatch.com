import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { MongoClient, ObjectId } from 'mongodb';

import * as mockData from './mock-data.json';

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

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  // If no connection string, we might be running in a PR environment
  // Just return mock data
  if (!connectionString || connectionString === '') {
    console.warn('MONGODB_CONNECTION_STRING not defined');

    context.res = {
      body: mockData,
    };

    return;
  }

  const client = new MongoClient(connectionString);

  const metricsData = [];

  try {
    // TODO: Get DB name from env so we can run separate staging DB
    const database = client.db('tpsw');
    const scriptsCollection = database.collection('scripts');
    const metricsCollection = database.collection('script-metrics');

    // TODO: Optionally filter by ID passed in query param
    const scripts = await scriptsCollection.find<Script>({}).toArray();

    const scriptMetricsLimit = new Date();
    // TODO: Get days from env, possibly query param?
    scriptMetricsLimit.setDate(scriptMetricsLimit.getDate() - 30);
    const scriptMetricsPast30Days = await metricsCollection
      .find<ScriptMetric>({
        ts: { $gt: scriptMetricsLimit },
      })
      .toArray();

    scripts.forEach((script) => {
      script.metrics = scriptMetricsPast30Days
        .filter((x) => x.script.equals(script._id))
        .map((x) => ({
          ...x,
          _id: undefined,
          script: undefined,
        }))
        .sort((a: any, b: any) => {
          if (a.ts.getTime() > b.ts.getTime()) {
            return 1;
          }
          if (a.ts.getTime() < b.ts.getTime()) {
            return -1;
          }
          return -1;
        });

      metricsData.push({ ...script, _id: undefined });
    });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  context.res = {
    body: metricsData,
  };
};

export default httpTrigger;
