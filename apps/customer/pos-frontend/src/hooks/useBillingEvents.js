import { useEffect, useRef } from 'react';

export const useBillingEvents = (onEvent) => {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[BILLING EVENTS] Hook initialized, token exists:', !!token);
    if (!token) return;

    // Create EventSource connection
    console.log('[BILLING EVENTS] Creating EventSource connection to /api/events/billing-events');
    eventSourceRef.current = new EventSource(`/api/events/billing-events`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    eventSourceRef.current.onopen = () => {
      console.log('[BILLING EVENTS] SSE connection opened successfully');
    };

    eventSourceRef.current.onmessage = (event) => {
      console.log('[BILLING EVENTS] Received SSE message:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('[BILLING EVENTS] Parsed data:', data);
        if (data.type !== 'heartbeat' && data.type !== 'connected') {
          console.log('[BILLING EVENTS] Calling onEvent with:', data);
          onEvent(data);
        } else {
          console.log('[BILLING EVENTS] Ignoring', data.type, 'message');
        }
      } catch (error) {
        console.error('[BILLING EVENTS] Error parsing SSE data:', error);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('[BILLING EVENTS] SSE connection error:', error);
      console.log('[BILLING EVENTS] Connection state:', eventSourceRef.current?.readyState);
      // Reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('[BILLING EVENTS] Attempting to reconnect...');
          eventSourceRef.current = null;
        }
      }, 5000);
    };

    return () => {
      console.log('[BILLING EVENTS] Cleaning up SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [onEvent]);

  return eventSourceRef.current;
};