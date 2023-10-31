module.exports = {
  apps: [
    {
      name: 'weatherbly',
      script: './dist/src/main.js',
      watch: '.',
      instances: 4,
      autorestart: true,
      watch: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      max_memory_restart: '1G',
      exec_mode: 'cluster',
      log_type: 'json',
      merge_logs: true,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_DATABASE: process.env.DB_DATABASE,

        PUBLIC_OPEN_API_BASE_URL: process.env.PUBLIC_OPEN_API_BASE_URL,
        PUBLIC_OPEN_API_SERVICE_KEY: process.env.PUBLIC_OPEN_API_SERVICE_KEY,
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
        JWT_EXPIRESIN: process.env.JWT_EXPIRESIN,
        NEST_APP_MODE: process.env.NEST_APP_MODE,
      },
    },
  ],
};
