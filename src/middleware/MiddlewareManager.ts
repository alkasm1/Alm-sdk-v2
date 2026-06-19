import type { MiddlewareContext, MiddlewareFn } from '../types/index.js';

export class MiddlewareManager {
  private middlewares: MiddlewareFn[] = [];

  use(middleware: MiddlewareFn): void {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }

    this.middlewares.push(middleware);
  }

  async execute(context: MiddlewareContext, finalHandler: () => Promise<void>): Promise<void> {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }

      index = i;

      const middleware = this.middlewares[i];

      if (!middleware) {
        return finalHandler();
      }

      return middleware(context, () => dispatch(i + 1));
    };

    return dispatch(0);
  }

  clear(): void {
    this.middlewares = [];
  }

  get count(): number {
    return this.middlewares.length;
  }
}
