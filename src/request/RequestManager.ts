import { Request } from '../contracts/Request.js';
import { RequestIdGenerator } from './RequestIdGenerator.js';
import { TimeoutError } from '../errors/TimeoutError.js';
import { TransportError } from '../errors/TransportError.js';
import { OpcodeRegistry } from './OpcodeRegistry.js';
import { PendingRequests } from './PendingRequests.js';
import { MiddlewareManager } from '../middleware/MiddlewareManager.js';
import { WebSocketTransport } from '../transports/WebSocketTransport.js';
import { HMACSigner } from '../security/HMACSigner.js';
import type { RequestContract, ResponseContract, MiddlewareContext } from '../types/index.js';

export interface RequestManagerConfig {
  registry: OpcodeRegistry;
  transport: WebSocketTransport;
  pending: PendingRequests;
  middleware: MiddlewareManager;
  signer?: HMACSigner;
  requestTimeout?: number;
}

export class RequestManager {
  private registry: OpcodeRegistry;
  private transport: WebSocketTransport;
  private pending: PendingRequests;
  private middleware: MiddlewareManager;
  private signer: HMACSigner | null;
  private defaultTimeout: number;

  constructor({
    registry,
    transport,
    pending,
    middleware,
    signer = null,
    requestTimeout = 30000,
  }: RequestManagerConfig) {
    this.registry = registry;
    this.transport = transport;
    this.pending = pending;
    this.middleware = middleware;
    this.signer = signer ?? null;
    this.defaultTimeout = requestTimeout;
  }

  async send({
    opcode,
    deviceId = null,
    payload = null,
    timeout = this.defaultTimeout,
    metadata = {},
  }: {
    opcode: string;
    deviceId?: string | null;
    payload?: Record<string, unknown> | null;
    timeout?: number;
    metadata?: Record<string, unknown>;
  }): Promise<ResponseContract> {
    const definition = this.registry.resolveOrThrow(opcode);

    const requestId = RequestIdGenerator.generate();

    const request = new Request({
      requestId,
      opcode: definition.name,
      deviceId,
      payload,
      timeout,
      metadata,
    });

    // Sign request if signer is available
    if (this.signer) {
      const signature = this.signer.sign(request.toJSON());
      request.metadata = {
        ...request.metadata,
        signature: signature.signature,
        timestamp: signature.timestamp,
        nonce: signature.nonce,
      };
    }

    const responsePromise = new Promise<ResponseContract>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.reject(
          requestId,
          new TimeoutError(`Request timed out: ${requestId}`, {
            requestId,
            opcode: definition.name,
            timeout,
          })
        );
      }, timeout);

      this.pending.add(requestId, {
        resolve,
        reject,
        timeoutId,
      });
    });

    const context: MiddlewareContext = {
      request: request.toJSON(),
      metadata: {},
    };

    try {
      await this.middleware.execute(context, async () => {
        await this.transport.send(request.toJSON());
      });
    } catch (error) {
      this.pending.reject(
        requestId,
        new TransportError(
          error instanceof Error ? error.message : 'Failed to send request',
          {
            requestId,
            opcode: definition.name,
            cause: error,
          }
        )
      );

      throw error;
    }

    return responsePromise;
  }

  handleResponse(response: ResponseContract): void {
    const requestId = response?.requestId;

    if (!requestId) {
      return;
    }

    this.pending.resolve(requestId, response);
  }

  generateRequestId(): string {
    return RequestIdGenerator.generate();
  }

  destroy(): void {
    this.pending.destroy();
  }
}
