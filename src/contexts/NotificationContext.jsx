'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { db } from '@/services/firebase.config';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const processedMessages = useRef(new Set());

  useEffect(() => {
    if (!user?.team?.id) return;

    const q = query(
      collection(db, 'chats'),
      where('teamId', '==', user.team.id),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const messageData = { id: change.doc.id, ...change.doc.data() };

          if (!processedMessages.current.has(messageData.id)) {
            processedMessages.current.add(messageData.id);

            const isNewMessage =
              messageData.timestamp?.seconds >= Date.now() / 1000 - 5;
            if (isNewMessage && messageData.userId !== user.id) {
              toast.info(`${messageData.userName}: ${messageData.message}`, {
                description: 'New message received',
              });
            }
          }
        }
      });
    });

    return () => {
      unsubscribe();
      processedMessages.current.clear();
    };
  }, [user?.team?.id, user?.id]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
