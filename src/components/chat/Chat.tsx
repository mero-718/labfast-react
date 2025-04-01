import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  styled,
  TextField,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';
import { Sidebar } from '@/components/common/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { createWebRTCService } from '@/services/webrtc';
import axios from 'axios';

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
  backgroundColor: '#F8F8F8',
  minHeight: '100vh',
  marginLeft: '280px',
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    padding: theme.spacing(1),
  },
}));

const TitleBar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1rem',
  '& .bar': {
    width: '4px',
    height: '24px',
    backgroundColor: '#FFA500',
    marginRight: '8px',
  },
});

const ChatContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 200px)',
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  overflow: 'hidden',
});

const ChatHeader = styled(Box)({
  padding: '16px',
  borderBottom: '1px solid #E0E0E0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const ChatMessages = styled(Box)({
  flex: 1,
  padding: '16px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const ChatInput = styled(Box)({
  padding: '16px',
  borderTop: '1px solid #E0E0E0',
  display: 'flex',
  gap: '8px',
});

const MessageBubble = styled(Box)<{ isOwn?: boolean }>(({ isOwn }) => ({
  maxWidth: '70%',
  padding: '12px 16px',
  borderRadius: '16px',
  backgroundColor: isOwn ? '#FEAF00' : '#F2EAE1',
  color: isOwn ? '#FFFFFF' : '#000000',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  position: 'relative',
}));

const MessageTime = styled(Typography)({
  fontSize: '0.75rem',
  color: '#666666',
  marginTop: '4px',
});

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface UserChat {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  isTyping?: boolean;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<UserChat[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webrtcService = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch online users
  const fetchOnlineUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/online`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(response.data.onlineUsers);
    } catch (error) {
      console.error('Error fetching online users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && 'id' in user) {
      webrtcService.current = createWebRTCService(user.id as string);
      webrtcService.current.onMessage = handleIncomingMessage;
      webrtcService.current.onTyping = handleTypingIndicator;
      webrtcService.current.onUserJoined = (userDetails: UserChat) => {
        setUsers(prev => {
          if (!prev.find(u => u.id === userDetails.id)) {
            return [...prev, userDetails];
          }
          return prev;
        });
      };
      webrtcService.current.onUserLeft = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
      };
      
      // Fetch initial online users
      fetchOnlineUsers();
    }

    return () => {
      webrtcService.current?.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleIncomingMessage = (message: any, fromUserId: string) => {
    if (message.type === 'chat') {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.text,
        sender: fromUserId,
        timestamp: new Date(message.timestamp),
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleTypingIndicator = (isTyping: boolean, fromUserId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === fromUserId 
          ? { ...user, isTyping } 
          : user
      )
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedUser) {
      // Send typing indicator
      webrtcService.current.sendTypingIndicator(true, selectedUser.id);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        webrtcService.current.sendTypingIndicator(false, selectedUser.id);
      }, 1000);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const message = {
        type: 'chat',
        text: newMessage.trim(),
        timestamp: new Date(),
      };

      webrtcService.current.sendMessage(message, selectedUser.id);
      
      const newMessageObj: Message = {
        id: Date.now().toString(),
        text: message.text,
        sender: 'me',
        timestamp: message.timestamp,
      };
      
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserSelect = (user: UserChat) => {
    setSelectedUser(user);
    webrtcService.current.initiateCall(user.id);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <MainContent>
        <Container maxWidth="xl" sx={{ padding: 0 }}>
          <Paper sx={{ p: 3, borderRadius: 2, mt: isMobile ? 0 : 3 }}>
            <TitleBar sx={{ marginLeft: isMobile ? 2 : 0 }}>
              <Typography variant="h6" fontWeight="bold">
                Chat Room
              </Typography>
            </TitleBar>

            <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
              {/* Users List */}
              <Paper sx={{ width: 280, p: 2, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                  Online Users
                </Typography>
                <List>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : users.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No users online
                    </Typography>
                  ) : (
                    users.map((user) => (
                      <ListItemButton
                        key={user.id}
                        selected={selectedUser?.id === user.id}
                        onClick={() => handleUserSelect(user)}
                      >
                        <ListItemAvatar>
                          <Badge
                            color={user.online ? 'success' : 'default'}
                            variant="dot"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          >
                            <Avatar src={user.avatar} alt={user.name} />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={user.name}
                          secondary={user.isTyping ? 'Typing...' : undefined}
                        />
                      </ListItemButton>
                    ))
                  )}
                </List>
              </Paper>

              {/* Chat Area */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <ChatContainer>
                  <ChatHeader>
                    {selectedUser ? (
                      <>
                        <Avatar src={selectedUser.avatar} alt={selectedUser.name} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {selectedUser.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedUser.online ? 'Online' : 'Offline'}
                            {selectedUser.isTyping && ' • Typing...'}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Typography variant="subtitle1" color="text.secondary">
                        Select a user to start chatting
                      </Typography>
                    )}
                  </ChatHeader>

                  <ChatMessages>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} isOwn={message.sender === 'me'}>
                        <Typography variant="body1">{message.text}</Typography>
                        <MessageTime>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </MessageTime>
                      </MessageBubble>
                    ))}
                    <div ref={messagesEndRef} />
                  </ChatMessages>

                  <ChatInput>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      disabled={!selectedUser}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '20px',
                          backgroundColor: '#F8F8F8',
                        },
                      }}
                    />
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={!selectedUser}
                      sx={{
                        backgroundColor: '#FEAF00',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#FF8C00',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#CCCCCC',
                        },
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </ChatInput>
                </ChatContainer>
              </Box>
            </Box>
          </Paper>
        </Container>
      </MainContent>
    </Box>
  );
}; 