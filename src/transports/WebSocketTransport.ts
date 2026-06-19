import WebSocket from 'ws';
import { BaseTransport } from './BaseTransport.js';
import { TransportError } from '../errors/TransportError.js';
import type { RequestContract, ResponseContract, TransportConfig } from '../types/index.js';

export class WebSocketTransport extends BaseTransport {
  private ws: WebSocket | null = null;
  private config: Required<TransportConfig>;
  private state: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' = 'DISCONNECTED';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private manualDisconnect = false;

  constructor(config: TransportConfig) {
    super();
    this.config = {
      endpoint: config.endpoint,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      reconnectDelay: config.reconnectDelay ?? 1000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
    };
  }

  get connected(): boolean {
    return this.state === 'CONNECTED';
  }

  async connect(): Promise<void> {
    if (this.state === 'CONNECTED' || this.state === 'CONNECTING') {
      return;
    }

    const url = this.config.endpoint;
    if (!url) {
      throw new TransportError('WebSocket endpoint is required');
    }

    this.manualDisconnect = false;
    this.state = 'CONNECTING';

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.state = 'CONNECTED';
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.onConnected?.();
        resolve();
      };

      this.ws.onerror = (error) => {
        this.onError?.(new TransportError(error.message));
        reject(error);
      };

      this.ws.onclose = () => {
        this.state = 'DISCONNECTED';
        this.stopHeartbeat();
        this.onDisconnected?.();
        if (!this.manualDisconnect) {
          this.handleReconnect();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as ResponseContract;
          this.onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message', error);
        }
      };
    });
  }

  async disconnect(): Promise<void> {
    this.manualDisconnect = true;
    this.state = 'DISCONNECTED';
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async send(request: RequestContract): Promise<void> {
    if (!this.connected || !this.ws) {
      throw new TransportError('Transport is not connected');
    }

    try {
      this.ws.send(JSON.stringify(request));
    } catch (error) {
      throw new TransportError(
        error instanceof Error ? error.message : 'Failed to send message'
      );
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      return;
    }

    this.state = 'RECONNECTING';
    this.onReconnecting?.(this.reconnectAttempts + 1);

    const delay = Math.min(
      this.config.reconnectDelay * 2 ** this.reconnectAttempts,
      30000
    );

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        this.handleReconnect();
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (!this.connected || !this.ws) return;
      try {
        this.ws.ping();
      } catch {
        // Ignore ping errors
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}
