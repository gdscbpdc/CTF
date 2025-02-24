'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  ScrollShadow,
  Avatar,
  Tooltip,
} from '@nextui-org/react';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase.config';
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  serverTimestamp,
  where,
} from 'firebase/firestore';

export default function TeamChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user?.team?.id) return;

    const q = query(
      collection(db, 'chats'),
      where('teamId', '==', user.team.id),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages.reverse());
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user?.team?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async () => {
    if (!message.trim() || !user?.team?.id) return;

    try {
      setIsLoading(true);
      await addDoc(collection(db, 'chats'), {
        teamId: user.team.id,
        userId: user.id,
        userName: user.name,
        message: message.trim(),
        timestamp: serverTimestamp(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user?.team) {
    return (
      <Card>
        <CardBody className='p-8 text-center'>
          <p className='text-default-500'>
            Join a team to access the team chat feature.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className='h-[600px] flex flex-col'>
      <CardBody className='p-4 flex flex-col gap-4'>
        <ScrollShadow className='flex-grow'>
          <div className='space-y-4'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.userId === user.id ? 'flex-row-reverse' : ''
                }`}
              >
                <Tooltip content={msg.userName}>
                  <Avatar
                    name={msg.userName}
                    size='sm'
                    className='flex-shrink-0'
                  />
                </Tooltip>
                <div
                  className={`px-4 py-2 rounded-lg max-w-[70%] ${
                    msg.userId === user.id
                      ? 'bg-primary text-foreground'
                      : 'bg-default-100'
                  }`}
                >
                  <p className='text-sm break-words'>{msg.message}</p>
                  <span className='text-xs opacity-70'>
                    {msg.timestamp?.toDate().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollShadow>

        <div className='flex gap-2'>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='Type your message...'
            endContent={
              <Button
                isIconOnly
                color='primary'
                size='sm'
                onPress={handleSend}
                isLoading={isLoading}
                isDisabled={!message.trim()}
              >
                <Send className='w-4 h-4 text-foreground' />
              </Button>
            }
          />
        </div>
      </CardBody>
    </Card>
  );
}
