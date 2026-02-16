import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useNotificationStore } from '@/stores/notificationStore';
import toast from 'react-hot-toast';

export function useRealtime() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Contact events
    socket.on('contact:created', () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('contact:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    });

    socket.on('contact:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Deal events
    socket.on('deal:created', () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('deal:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('deal:stageChanged', () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('deal:completed', () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('deal:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Task events
    socket.on('task:created', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('task:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    socket.on('task:completed', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('task:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Ticket events
    socket.on('ticket:created', () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    });

    socket.on('ticket:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    });

    socket.on('ticket:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    });

    // Notification events
    socket.on('notification:new', (notification: any) => {
      addNotification(notification);
      toast(notification.title, {
        icon: '🔔',
        duration: 5000,
      });
    });

    // Activity events
    socket.on('activity:created', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    });

    return () => {
      socket.off('contact:created');
      socket.off('contact:updated');
      socket.off('contact:deleted');
      socket.off('deal:created');
      socket.off('deal:updated');
      socket.off('deal:stageChanged');
      socket.off('deal:completed');
      socket.off('deal:deleted');
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:completed');
      socket.off('task:deleted');
      socket.off('ticket:created');
      socket.off('ticket:updated');
      socket.off('ticket:deleted');
      socket.off('notification:new');
      socket.off('activity:created');
    };
  }, [queryClient, addNotification]);
}
