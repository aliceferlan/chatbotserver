import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { postHandler } from './post';

const name = 'messaging';

const router =  function (server: FastifyInstance, _: any, next: any) {

  server.post(`/${name}/event`,  {
    handler: postHandler,
  });

  next();
};

export default fastifyPlugin(router, {
  name,
  fastify: '3.x',
});
