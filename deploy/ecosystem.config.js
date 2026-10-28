module.exports = {
  apps: [
    {
      name: "rhenis-next",
      cwd: "/var/www/rhenis",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        SKEW_LINE_ACTIVE_BACKEND: "dotnet",
        SKEW_LINE_DOTNET_BASE_URL: "http://127.0.0.1:5000",
      },
    },
  ],
};
