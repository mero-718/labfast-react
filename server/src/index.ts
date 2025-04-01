import express from 'express';
import http from 'http';
import cors from 'cors';
import { createWebSocketManager } from './websocket';

const app = express();
const server = http.createServer(app);
const wss = createWebSocketManager(server);

// Middleware
app.use(cors());
app.use(express.json());

app.get('/api/users/online', (req, res) => {
  const onlineUsers = wss.getOnlineUsers();
  res.json({ onlineUsers });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 