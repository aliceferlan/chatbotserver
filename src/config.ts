import * as line from '@line/bot-sdk';

const lineClientConfig: line.ClientConfig = {
  channelAccessToken: '2007081589',
  channelSecret: 'a3a8d92d4dc3d7c080935511290bcdcb',
};

const config = {
  lineClientConfig,
  baseUrl: '[SERVER BASE URL]',
  certFilePath: {
    key: '../cert/privkey.pem',
    cert: '../cert/fullchain.pem',
  }
};

export default config;
