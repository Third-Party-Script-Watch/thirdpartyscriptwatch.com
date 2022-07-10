import { ObjectId } from 'mongodb';

export type ScriptMetric = {
  script?: ObjectId;
  scriptId?: string;
  retrieved: Date;
  url: string;
  isInitialRequest: boolean;
  contentType: string;
  contentEncoding: string;
  contentLength: number;
  contentLengthUncompressed: number;
};
