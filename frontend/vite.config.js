import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // GitHub Analytics routes
            '/github': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            // Test/Mock routes
            '/test': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            // Voice Chat WebSocket
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true,
                changeOrigin: true,
            },
            // Existing routes — already have /api in their @Controller prefix
            '/api/evaluate': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/api/chat': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            // Shortlisting routes — /api stripped before hitting NestJS
            '/api/shortlist': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/api/admin': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
