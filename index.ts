import server from './server';

try {
  const port = process.env.APPSERVER_PORT || 443;
  server.listen(port, '0.0.0.0', (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.info(`Starting LINE Bot Example Server listening at ${address}`);
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}
