import * as line from '@line/bot-sdk';

const lineClientConfig: line.ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '[CHANNEL ACCESS TOKEN]',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '[CHANNEL SECRET]',
};

const config = {
  lineClientConfig,
  baseUrl: process.env.BASE_URL || '[SERVER BASE URL]',
  // Vercelでは証明書ファイルは不要
};

export default config;