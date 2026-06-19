import { EventEmitter } from 'events';
import { EventPipeline } from '../events/EventPipeline.js';
import { EventNormalizer } from '../events/EventNormalizer.js';
import { EventContractFactory } from '../events/EventContractFactory.js';
import { EventRouter } from '../events/EventRouter.js';
import { TaskEventContract } from '../events/contracts/TaskEventContract.js';
import { DeviceEventContract } from '../events/contracts/DeviceEventContract.js';
import { OpcodeRegistry } from '../request/OpcodeRegistry.js';
import { RequestManager } from '../request/RequestManager.js';
import { PendingRequests } from '../request/PendingRequests.js';
import { WebSocketTransport } from '../transports/WebSocketTransport.js';
import { MiddlewareManager } from '../middleware/MiddlewareManager.js';
import { SystemModule } from '../modules/SystemModule.js';
import { TasksModule } from '../modules/TasksModule.js';
import { DeviceModule } from '../modules/DeviceModule.js';
import { DeviceManager } from '../device/DeviceManager.js';
import { TaskManager } from '../task/TaskManager.js';
import { EventRepository } from '../persistence/EventRepository.js';
import { ReplayEngine } from '../persistence/ReplayEngine.js';
import { HMACSigner } from '../security/HMACSigner.js';
import { Logger } from '../utils/Logger.js';
import type { ALMConfig, EventData, MiddlewareFn, ResponseContract } from '../types/index.js';

export class ALMClient {
  private config: ALMConfig;
  private logger: Logger;
  private middleware: MiddlewareManager;
  private registry: OpcodeRegistry;
  private pending: PendingRequests;
  private transport: WebSocketTransport;
  requestManager: RequestManager;
  private events: EventEmitter;
  devices: DeviceManager;
  taskManager: TaskManager;
  private eventPipeline: EventPipeline;
  private eventRouter: EventRouter;
  private modules: Map<string, unknown>;
  private eventStore: EventRepository;
  private replayEngine: ReplayEngine;
  private signer: HMACSigner | null;

  system!: SystemModule;
  tasks!: TasksModule;
  device!: DeviceModule;

  constructor(config: ALMConfig) {
    this.config = config;
    this.logger = new Logger({ level: 'info' });

    this.middleware = new MiddlewareManager();
    this.registry = new OpcodeRegistry();
    this.pending = new PendingRequests();

    this.transport = new WebSocketTransport({
      endpoint: config.endpoint,
      maxReconnectAttempts: config.maxReconnectAttempts,
      reconnectDelay: config.reconnectDelay,
      heartbeatInterval: config.heartbeatInterval,
    });

    this.signer = config.secret ? new HMACSigner(config.secret) : null;

    this.requestManager = new RequestManager({
      registry: this.registry,
      transport: this.transport,
      pending: this.pending,
      middleware: this.middleware,
      signer: this.signer,
      requestTimeout: config.requestTimeout,
    });

    this.events = new EventEmitter();
    this.events.setMaxListeners(100);

    this.devices = new DeviceManager(this);
    this.taskManager = new TaskManager(this);

    this.eventPipeline = new EventPipeline();
    this.eventRouter = new EventRouter();
    this.eventStore = new EventRepository();
    this.replayEngine = new ReplayEngine(this.eventStore);

    this.modules = new Map();

    this.eventPipeline.use(async (event) => EventNormalizer.normalize(event));

    this.transport.onMessage = (message) => this._handleIncoming(message as ResponseContract);
    this.transport.onConnected = () => this.events.emit('transport.connected');
    this.transport.onDisconnected = () => this.events.emit('transport.disconnected');
    this.transport.onReconnecting = (attempt) => this.events.emit('transport.reconnecting', { attempt });
    this.transport.onError = (error) => this.events.emit('transport.error', error);

    this.registerModule(SystemModule);
    this.registerModule(TasksModule);
    this.registerModule(DeviceModule);
  }

  on(event: string, handler: (data: unknown) => void): void {
    this.events.on(event, handler);
  }

  off(event: string, handler: (data: unknown) => void): void {
    this.events.off(event, handler);
  }

  once(event: string, handler: (data: unknown) => void): void {
    this.events.once(event, handler);
  }

  use(middleware: MiddlewareFn): void {
    this.middleware.use(middleware);
  }

  async connect(): Promise<void> {
    await this.transport.connect();
  }

  async disconnect(): Promise<void> {
    await this.transport.disconnect();
    this.pending.destroy();
  }

  private registerModule(ModuleClass: typeof SystemModule | typeof TasksModule | typeof DeviceModule): void {
    const name = (ModuleClass as typeof SystemModule).moduleName;

    if (!name) {
      throw new Error('Module must define static moduleName');
    }

    if (this.modules.has(name)) {
      throw new Error(`Module already registered: ${name}`);
    }

    if (typeof (ModuleClass as typeof SystemModule).registerOpcodes === 'function') {
      (ModuleClass as typeof SystemModule).registerOpcodes(this.registry);
    }

    const instance = new (ModuleClass as new (client: ALMClient) => SystemModule)(this);
    this.modules.set(name, instance);

    if (name === 'system') this.system = instance as SystemModule;
    if (name === 'tasks') this.tasks = instance as TasksModule;
    if (name === 'device') this.device = instance as DeviceModule;
  }

  getModule<T>(name: string): T | null {
    return (this.modules.get(name) as T) ?? null;
  }

  replay(fromTimestamp?: number): EventData[] {
    return this.replayEngine.replay(fromTimestamp);
  }

  replayEvents(type: string, fromTimestamp?: number): EventData[] {
    return this.replayEngine.replayType(type, fromTimestamp);
  }

  private async _handleIncoming(message: ResponseContract | Record<string, unknown>): Promise<void> {
    if (!message || typeof message !== 'object') return;

    if ('requestId' in message && message.requestId) {
      this.requestManager.handleResponse(message as ResponseContract);
      return;
    }

    const processed = await this.eventPipeline.process(message as EventData);
    if (!processed) return;

    this._routeEvent(processed);
  }

  private _routeEvent(event: EventData): void {
    if (!event || typeof event !== 'object') return;

    const type = event.type || 'unknown';
    const contract = EventContractFactory.create(event);
    if (!contract) return;

    this.eventStore.append(contract);

    switch (type) {
      case 'device.event':
        if (DeviceEventContract.validate(contract)) {
          this.devices.update(contract);
        }
        break;
      case 'task.event':
        if (TaskEventContract.validate(contract)) {
          this.taskManager.update(contract);
        }
        break;
    }

    this.eventRouter.handle(contract);
    this.events.emit(type, contract);

    const systemEvents = ['device.event', 'task.event'];
    if (!systemEvents.includes(type)) {
      this.events.emit('runtime.event', contract);
    }

    this.events.emit('event.normalized', contract);
  }
}
