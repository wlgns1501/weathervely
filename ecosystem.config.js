module.exports = {
  apps: [
    {
      name: 'weatherbly',
      script: 'dist/src/main.js',
      watch: '.',
      instandces: 4,
      autorestart: true,
      watch: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      max_memory_restart: '1G',
      exec_mode: 'cluster',
      log_type: 'json',
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
      },
    },
  ],
};
