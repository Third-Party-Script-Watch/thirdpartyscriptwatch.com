import { ObjectId } from 'mongodb';

export type ScriptMetric = {
  script?: ObjectId;
  retrieved: Date;
  contentType: string;
  contentEncoding: string;
  contentLength: number;
  contentLengthUncompressed: number;
};
