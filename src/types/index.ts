/**
 * ALM SDK Core Types
 */

export interface ALMConfig {
  endpoint: string;
  secret?: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  requestTimeout?: number;
  deviceId?: string;
}

export interface DeviceInfo {
  id: string;
  hostname: string;
  platform: string;
  status: DeviceStatus;
  version?: string;
  lastSeen?: number;
  [key: string]: unknown;
}

export type DeviceStatus = 'online' | 'offline' | 'unknown';

export interface TaskInfo {
  taskId: string;
  status: TaskStatus;
  deviceId?: string;
  command?: string;
  createdAt: number;
  updatedAt?: number;
  completedAt?: number;
  error?: string;
  [key: string]: unknown;
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'unknown';

export interface EventData {
  type: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface MiddlewareContext {
  request: RequestContract;
  response?: ResponseContract;
  metadata: Record<string, unknown>;
}

export type MiddlewareFn = (
  ctx: MiddlewareContext,
  next: () => Promise<void>
) => Promise<void>;

export type EventHandler<T = EventData> = (event: T) => void;

export interface TransportState {
  state: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING';
  connected: boolean;
}

export interface RequestContract {
  requestId: string;
  opcode: string;
  deviceId?: string | null;
  payload?: Record<string, unknown> | null;
  timeout?: number;
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

export interface ResponseContract {
  requestId: string;
  success: boolean;
  duration?: number;
  result?: Record<string, unknown> | null;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null;
  timestamp?: number;
}

export interface OpcodeDefinitionContract {
  name: string;
  version: number;
  transports: string[];
  signature?: string | null;
  permissions: string[];
}

export interface EventContractData {
  eventId: string;
  type: string;
  source?: string | null;
  payload?: Record<string, unknown> | null;
  version?: number;
  timestamp: number;
}

export interface SignatureResult {
  signature: string;
  timestamp: number;
  nonce: string;
}

export interface PendingRequestEntry {
  resolve: (value: ResponseContract) => void;
  reject: (reason: Error) => void;
  timeoutId: ReturnType<typeof setTimeout> | null;
  startedAt: number;
}

export interface TransportConfig {
  endpoint: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  prefix?: string;
}
