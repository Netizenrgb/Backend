import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // this will redirect the request from vite (frontend to backend) to the express , the request starting with 
  // "/api"
  server:{
    proxy:{
      "/api":{
        // express url
        target:"http://localhost:3000"
      }
    }
  }
});
