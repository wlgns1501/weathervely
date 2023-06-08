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
    },
  ],
};
