import type { RequestContract, ResponseContract } from '../types/index.js';

export abstract class BaseTransport {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract send(request: RequestContract): Promise<void>;

  onMessage?: (message: ResponseContract | Record<string, unknown>) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: (attempt: number) => void;
  onError?: (error: Error) => void;
}
