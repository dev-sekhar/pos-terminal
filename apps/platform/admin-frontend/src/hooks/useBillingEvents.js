import { useEffect, useRef } from 'react';

export const useBillingEvents = (onEvent) => {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connect = () => {
      // Use customer backend for events (cross-origin)
      eventSourceRef.current = new EventSource(`http://localhost:5000/api/events/billing-events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'heartbeat' && data.type !== 'connected') {
            onEvent(data);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connect();
          }
        }, 5000);
      };
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [onEvent]);

  return eventSourceRef.current;
};