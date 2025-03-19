import fs from 'fs';
import path from 'path';
import * as line from '@line/bot-sdk';
import config from '../config';

const client = new line.Client(config.lineClientConfig);

const downloadContent = async (messageId: string, downloadPath: string): Promise<string> => {
  const stream = await client.getMessageContent(messageId);
  return new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(downloadPath);
    stream.pipe(writable);
    stream.on('end', () => { resolve(messageId); });
    stream.on('error', () => { reject(); });
  });
};

const downloadImageContent = async (imageEventMessage: line.ImageEventMessage): Promise<string> => {
  const exp = 'jpg';
  const downloadPath= path.join(__dirname, '../public', 'downloaded', `${imageEventMessage.id}.${exp}`);
  const messageId = await downloadContent(imageEventMessage.id, downloadPath); // get image file from LINE platform
  const imageUrl = `${config.baseUrl}/downloaded/${messageId}.${exp}`;
  return imageUrl;
};

export const dispatchMessageEvent = async (event: line.MessageEvent): Promise<(Promise<line.MessageAPIResponseBase> | undefined)[]> => {
  let result = undefined;
  const replyToken: string = event.replyToken; // message event has a reply token
  let textEventMessage: line.TextEventMessage;
  let imageEventMessage: line.ImageEventMessage;
  let imageUrl: string;
  switch (event.message.type) {
  case 'text':
    textEventMessage = {
      type: 'text',
      id: event.message.id,
      text: event.message.text,
    };
    result = client.replyMessage(
      replyToken,
      textEventMessage,
    );
    break;
  case 'image':
    imageEventMessage = {
      type: 'image',
      contentProvider: event.message.contentProvider,
      id: event.message.id,
    }
    imageUrl = await downloadImageContent(imageEventMessage);
    textEventMessage = {
      type: 'text',
      id: event.message.id,
      text: imageUrl,
    };
    result = client.replyMessage(
      replyToken,
      textEventMessage,
    );
    break;
  default:
    textEventMessage = {
      type: 'text',
      id: event.message.id,
      text: 'Server receinved an invalid message type',
    };
    result = client.replyMessage(
      replyToken,
      textEventMessage,
    );
  }
  return [result];
};
