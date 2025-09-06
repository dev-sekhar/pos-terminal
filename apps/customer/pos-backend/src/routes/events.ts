import { Router, Request, Response } from 'express';
import { billingEventService } from '../services/eventService';

const router = Router();

// SSE endpoint for billing events
router.get('/billing-events', (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  console.log('[SSE] New SSE connection request for tenant:', tenantId);
  if (!tenantId) {
    console.log('[SSE] Unauthorized - no tenantId');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  const connectMsg = JSON.stringify({ type: 'connected', tenantId });
  console.log('[SSE] Sending connection message:', connectMsg);
  res.write(`data: ${connectMsg}\n\n`);

  // Subscribe to tenant events
  console.log('[SSE] Subscribing to events for tenant:', tenantId);
  const unsubscribe = billingEventService.subscribeTenantEvents(tenantId, (event, data) => {
    const eventMsg = JSON.stringify({ type: event, data });
    console.log('[SSE] Sending event to client:', eventMsg);
    res.write(`data: ${eventMsg}\n\n`);
  });

  // Handle client disconnect
  req.on('close', () => {
    console.log('[SSE] Client disconnected for tenant:', tenantId);
    unsubscribe();
  });

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    const heartbeatMsg = JSON.stringify({ type: 'heartbeat' });
    console.log('[SSE] Sending heartbeat to tenant:', tenantId);
    res.write(`data: ${heartbeatMsg}\n\n`);
  }, 30000);

  req.on('close', () => {
    console.log('[SSE] Cleaning up for tenant:', tenantId);
    clearInterval(heartbeat);
    unsubscribe();
  });
});

export default router;