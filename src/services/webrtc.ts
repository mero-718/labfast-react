import { websocketService } from './websocket';

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
}

interface TypingMessage {
  type: 'typing';
  isTyping: boolean;
}

interface ChatMessage {
  type: 'chat';
  text: string;
  timestamp: Date;
}

type Message = TypingMessage | ChatMessage;

interface UserDetails {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
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

class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localUserId: string;
  private typingTimeout: NodeJS.Timeout | null = null;
  private socket: WebSocket | null = null;

  constructor(userId: string) {
    this.localUserId = userId;
    this.connect();
  }

  private connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'user-joined':
          this.onUserJoined?.(message.userId);
          break;
        case 'user-left':
          this.onUserLeft?.(message.userId);
          break;
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          this.handleSignalingMessage(message);
          break;
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleSignalingMessage(message: SignalingMessage) {
    // ... existing signaling message handling ...
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, fromUserId: string) {
    const peerConnection = this.createPeerConnection(fromUserId);
    await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.connection.createAnswer();
    await peerConnection.connection.setLocalDescription(answer);
    websocketService.send({
      type: 'answer',
      answer,
      to: fromUserId,
    });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit, fromUserId: string) {
    const peerConnection = this.peerConnections.get(fromUserId);
    if (peerConnection) {
      await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit, fromUserId: string) {
    const peerConnection = this.peerConnections.get(fromUserId);
    if (peerConnection) {
      await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private handleUserJoined(userId: string) {
    if (userId !== this.localUserId) {
      this.createPeerConnection(userId);
    }
  }

  private handleUserLeft(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.connection.close();
      this.peerConnections.delete(userId);
    }
  }

  private createPeerConnection(userId: string): PeerConnection {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    };

    const connection = new RTCPeerConnection(configuration);
    const dataChannel = connection.createDataChannel('chat');

    dataChannel.onopen = () => {
      console.log(`Data channel opened with ${userId}`);
    };

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message;
      if (message.type === 'chat') {
        this.onMessage?.(message, userId);
      } else if (message.type === 'typing') {
        this.onTyping?.(message.isTyping, userId);
      }
    };

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        websocketService.send({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: userId,
        });
      }
    };

    const peerConnection = { connection, dataChannel };
    this.peerConnections.set(userId, peerConnection);

    return peerConnection;
  }

  public async initiateCall(userId: string) {
    const peerConnection = this.createPeerConnection(userId);
    const offer = await peerConnection.connection.createOffer();
    await peerConnection.connection.setLocalDescription(offer);
    websocketService.send({
      type: 'offer',
      offer,
      to: userId,
    });
  }

  public sendMessage(message: ChatMessage, toUserId: string) {
    const peerConnection = this.peerConnections.get(toUserId);
    if (peerConnection?.dataChannel?.readyState === 'open') {
      peerConnection.dataChannel.send(JSON.stringify(message));
    }
  }

  public sendTypingIndicator(isTyping: boolean, toUserId: string) {
    const peerConnection = this.peerConnections.get(toUserId);
    if (peerConnection?.dataChannel?.readyState === 'open') {
      const message: TypingMessage = {
        type: 'typing',
        isTyping,
      };
      peerConnection.dataChannel.send(JSON.stringify(message));
    }
  }

  public onMessage?: (message: ChatMessage, fromUserId: string) => void;
  public onTyping?: (isTyping: boolean, fromUserId: string) => void;
  public onUserJoined?: (userId: string) => void;
  public onUserLeft?: (userId: string) => void;

  public disconnect() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.connection.close();
    });
    this.peerConnections.clear();
  }
}

export const createWebRTCService = (userId: string) => new WebRTCService(userId); 