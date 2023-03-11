export default () => ({
  port: parseInt(process.env.PORT) || 5001,
  app_url: process.env.APP_URL || 'http://localhost:5001',
  dbConfig: {
    mongo_url: process.env.MONGO_URL,
    expires: parseInt(process.env.EXPIRATION_TIME) || '1d',
  },
});
