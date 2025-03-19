import { FastifySchema, RouteHandlerMethod } from 'fastify';
import line from '@line/bot-sdk';
import { dispatchMessageEvent } from '../../lib/event';

export const postSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['destination', 'events'],
    properties: {
      destination: { type: 'string' },
      events: { type: 'array' },
    },
  },
};

export const postHandler: RouteHandlerMethod = async (request, reply) => {
    const body: line.WebhookRequestBody = request.body as any;
    const destination: string = body.destination;
    const events: line.WebhookEvent[] = body.events;
    console.log(`Destination: ${destination}`);
    console.log(`Events: ${JSON.stringify(events)}`);
    if (events.length < 1) reply.send({}); // for webhook test in developer console
    const event = events[0];
    let response;
    if (event.type === 'message') { // request body is a message event
      [response] = await dispatchMessageEvent(event);
    }
    if (!response) throw 'Server could not have a valid response message';
    console.log(`LINE Request ID: ${JSON.stringify(await response)}`);
    reply.send(response);
};
