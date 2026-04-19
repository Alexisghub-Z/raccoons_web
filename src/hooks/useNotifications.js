import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationService } from '../api/notification.service';

const POLL_INTERVAL = 30_000;

export function useNotifications(isAuthenticated) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getUnread();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setNotifications(list);
      setUnreadCount(list.length);
    } catch {
      // silencioso — no interrumpir la sesión si falla el polling
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetch();
    intervalRef.current = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [isAuthenticated, fetch]);

  const markRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationService.markRead(id);
    } catch {
      // Recargar en caso de fallo
      fetch();
    }
  }, [fetch]);

  const markAllRead = useCallback(async () => {
    const ids = notifications.map(n => n.id);
    setNotifications([]);
    setUnreadCount(0);
    try {
      await Promise.all(ids.map(id => notificationService.markRead(id)));
    } catch {
      fetch();
    }
  }, [notifications, fetch]);

  const refresh = useCallback(() => {
    fetch();
  }, [fetch]);

  return { notifications, unreadCount, markRead, markAllRead, refresh };
}
