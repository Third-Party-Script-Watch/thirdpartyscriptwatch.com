import { ObjectId } from 'mongodb';
import { ScriptMetric } from './script-metric';

export type Script = {
  _id?: ObjectId;
  id: string;
  name: string;
  url: string;
  initialisationHtml?: string;
  metrics?: ScriptMetric[];
};
