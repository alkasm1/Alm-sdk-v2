import { Logger } from '../utils/Logger.js';
import type { MiddlewareContext, MiddlewareFn } from '../types/index.js';

export function LoggingMiddleware(logger = new Logger({ level: 'info' })): MiddlewareFn {
  return async (ctx: MiddlewareContext, next: () => Promise<void>) => {
    const start = performance.now();
    const opcode = ctx.request.opcode;

    logger.info(`[Middleware] => ${opcode}`);

    try {
      await next();

      const duration = performance.now() - start;
      logger.info(`[Middleware Done] => ${opcode} (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`[Middleware Error] => ${opcode} (${duration.toFixed(2)}ms)`, error);
      throw error;
    }
  };
}
