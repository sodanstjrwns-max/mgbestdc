module.exports = {
  apps: [
    {
      name: 'magok-best-dental',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=magok-best-dental-production --r2=magok-best-dental-media --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
