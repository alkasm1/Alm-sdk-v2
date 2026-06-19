import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestManager } from '../../src/request/RequestManager';
import { OpcodeRegistry } from '../../src/request/OpcodeRegistry';
import { PendingRequests } from '../../src/request/PendingRequests';
import { WebSocketTransport } from '../../src/transports/WebSocketTransport';
import { MiddlewareManager } from '../../src/middleware/MiddlewareManager';
import { OpcodeDefinition } from '../../src/contracts/OpcodeDefinition';
import { TimeoutError } from '../../src/errors/TimeoutError';

describe('RequestManager', () => {
  let requestManager: RequestManager;
  let registry: OpcodeRegistry;
  let transport: WebSocketTransport;
  let pending: PendingRequests;
  let middleware: MiddlewareManager;

  beforeEach(() => {
    registry = new OpcodeRegistry();
    registry.register(new OpcodeDefinition({ name: 'system.info' }));

    transport = new WebSocketTransport({ endpoint: 'ws://localhost:8080' });
    pending = new PendingRequests();
    middleware = new MiddlewareManager();

    requestManager = new RequestManager({
      registry,
      transport,
      pending,
      middleware,
    });
  });

  it('should generate unique request IDs', () => {
    const id1 = requestManager.generateRequestId();
    const id2 = requestManager.generateRequestId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^req_\d+_[a-f0-9]{16}$/);
  });

  it('should handle response correctly', async () => {
    const mockResponse = {
      requestId: 'req_123',
      success: true,
      result: { data: 'test' },
      duration: 0,
      error: null,
      timestamp: Date.now(),
    };

    const promise = requestManager.send({
      opcode: 'system.info',
      deviceId: 'test-device',
    });

    requestManager.handleResponse(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should timeout on no response', async () => {
    vi.useFakeTimers();

    const promise = requestManager.send({
      opcode: 'system.info',
      timeout: 1000,
    });

    vi.advanceTimersByTime(1001);

    await expect(promise).rejects.toThrow(TimeoutError);
  });

  afterEach(() => {
    requestManager.destroy();
    vi.useRealTimers();
  });
});
