import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { MongoClient } from 'mongodb';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  if (!connectionString || connectionString === '') {
    throw new Error('MONGODB_CONNECTION_STRING not defined');
  }

  const client = new MongoClient(connectionString);

  const metricsData = [];

  try {
    const database = client.db('tpsw');
    const scriptsCollection = database.collection('scripts');
    const metricsCollection = database.collection('script-metrics');

    const scripts = await scriptsCollection.find().toArray();

    const scriptMetricsLimit = new Date();
    scriptMetricsLimit.setDate(scriptMetricsLimit.getDate() - 30);
    const scriptMetricsPast30Days = await metricsCollection
      .find({
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
