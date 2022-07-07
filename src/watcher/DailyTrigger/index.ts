import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { launch } from 'puppeteer';
import axios from 'axios';
import * as zlib from 'zlib';

import * as scripts from './scripts.json';

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
  const stats = [];

  if (method === 'fetch') {
    for (let i = 0; i < scripts.length; i++) {
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

      stats.push({
        id: scripts[i].id,
        name: scripts[i].displayName,
        url: scripts[i].scriptUrl,
        contentLength: parseInt(headers['content-length'], 10),
        contentEncoding: headers['content-encoding'],
        contentType: headers['content-type'],
        contentLengthDecoded: content.length,
      });
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
        stats.push({
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

  console.log(stats);

  // context.res = {
  //   body: stats,
  // };
};

export default timerTrigger;
