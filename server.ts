import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyStatic from 'fastify-static';
import { readFileSync } from 'fs';
import path from 'path';
import config from './config';

const options = {
  logger: false,
  https: {
    key: readFileSync(path.join(__dirname, config.certFilePath.key)),
    cert: readFileSync(path.join(__dirname, config.certFilePath.cert)),
  },
};
const server = fastify(options);
server.register(fastifyCors, {
  exposedHeaders: ['X-Total-Count'],
});
server.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

server.get('/', async (_, rep) => {
  rep.sendFile('index.html');
});

// routers
server.register(import('./routers/messaging'));

export default server;
