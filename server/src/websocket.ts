import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

// WebRTC types
interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp: string;
}

interface RTCIceCandidateInit {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string;
}

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left';
  to?: string;
  from?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  userId?: string;
}

interface UserDetails {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private userDetails: Map<string, UserDetails> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: WebSocketClient, req) => {
      try {
        // Extract token from query parameters
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        console.log(url);
        const token = url.searchParams.get('token');

        if (!token) {
          ws.close(1008, 'Authentication required');
          return;
        }

        // Set up client
        ws.userId = '1';
        ws.isAlive = true;

        // Add to clients map
        this.clients.set(ws.userId as string, ws);

        // Add user details
        this.userDetails.set(ws.userId as string, {
          id: ws.userId as string,
          name: 'Test User',
          avatar: '/avatar/man.png',
          online: true,
        });

        // Notify others about new user
        this.broadcastUserJoined(ws.userId as string);

        // Set up ping/pong for connection health
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        // Handle incoming messages
        ws.on('message', (data: string) => {
          try {
            const message: SignalingMessage = JSON.parse(data);
            this.handleMessage(ws, message);
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });

        // Handle client disconnect
        ws.on('close', () => {
          if (ws.userId) {
            this.clients.delete(ws.userId);
            this.broadcastUserLeft(ws.userId);
          }
        });

        // Handle errors
        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          if (ws.userId) {
            this.clients.delete(ws.userId);
            this.broadcastUserLeft(ws.userId);
          }
        });

      } catch (error) {
        console.error('Error in WebSocket connection:', error);
        ws.close(1011, 'Internal server error');
      }
    });

    // Set up interval to check for dead connections
    setInterval(() => {
      Array.from(this.wss.clients).forEach((ws) => {
        const client = ws as WebSocketClient;
        if (!client.isAlive) {
          if (client.userId) {
            this.clients.delete(client.userId);
            this.broadcastUserLeft(client.userId);
          }
          return client.terminate();
        }
        client.isAlive = false;
      });
    }, 30000); // Check every 30 seconds
  }

  private handleMessage(sender: WebSocketClient, message: SignalingMessage) {
    if (!sender.userId) return;

    message.from = sender.userId;

    switch (message.type) {
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        if (message.to) {
          const targetClient = this.clients.get(message.to);
          if (targetClient && targetClient.readyState === WebSocket.OPEN) {
            targetClient.send(JSON.stringify(message));
          }
        }
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private broadcastUserJoined(userId: string) {
    const message: SignalingMessage = {
      type: 'user-joined',
      userId,
    };

    this.broadcast(message, userId);
  }

  private broadcastUserLeft(userId: string) {
    const message: SignalingMessage = {
      type: 'user-left',
      userId,
    };

    this.userDetails.delete(userId);
    this.broadcast(message);
  }

  private broadcast(message: SignalingMessage, excludeUserId?: string) {
    Array.from(this.wss.clients).forEach((ws) => {
      const client = ws as WebSocketClient;
      if (client.readyState === WebSocket.OPEN && client.userId !== excludeUserId) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public getOnlineUsers(): UserDetails[] {
    return Array.from(this.userDetails.values());
  }

  public isUserOnline(userId: string): boolean {
    return this.clients.has(userId);
  }
}

export const createWebSocketManager = (server: Server) => new WebSocketManager(server); 