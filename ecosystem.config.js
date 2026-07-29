module.exports = {
  apps: [
    {
      name: "mvpx",
      script: ".next/standalone/server.js",
      // Giới hạn bộ nhớ Heap của Node.js phù hợp để tránh OOM khi xử lý buffer ảnh Sharp
      node_args: "--max-old-space-size=512",
      // Tự động restart nếu bộ nhớ vượt quá 600MB
      max_memory_restart: "600M",
      
      env_file: ".env",
      env: {
        PORT: 3001,
        NEXTAUTH_URL: "https://mayvanphongxanh.com",
        AUTH_TRUST_HOST: "true"
      }
    }
  ]
}

