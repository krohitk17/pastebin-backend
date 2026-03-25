export default () => ({
  port: parseInt(process.env.PORT || '5001', 10),
  app_url: process.env.APP_URL || 'http://localhost:5001',
  cors_origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  securityConfig: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },
  authConfig: {
    accessTokenSecret:
      process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    refreshTokenSecret:
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  dbConfig: {
    mongo_url: process.env.MONGO_URL,
    expires: process.env.EXPIRATION_TIME || '1d',
  },
  s3Config: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  },
});
