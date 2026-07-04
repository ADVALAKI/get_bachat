module.exports = {
  apps: [
    {
      name: "getbachat",
      script: "server.js",
      cwd: "./.next/standalone",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        // Add your Cuelinks API keys or secrets below when deploying:
        NEXT_PUBLIC_ROUTING_MODE: "CUELINKS",
      },
    },
  ],
};
