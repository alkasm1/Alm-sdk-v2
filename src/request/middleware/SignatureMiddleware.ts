import { HMACSigner } from '../../security/HMACSigner.js';
import type { MiddlewareContext, MiddlewareFn } from '../../types/index.js';

export function SignatureMiddleware(secret: string): MiddlewareFn {
  const signer = new HMACSigner(secret);

  return async (ctx: MiddlewareContext, next: () => Promise<void>) => {
    const payload = {
      opcode: ctx.request.opcode,
      requestId: ctx.request.requestId,
      deviceId: ctx.request.deviceId,
      payload: ctx.request.payload,
      timestamp: Date.now(),
    };

    const signature = signer.sign(payload);

    ctx.request.metadata = {
      ...ctx.request.metadata,
      signature: signature.signature,
      signatureTimestamp: signature.timestamp,
      nonce: signature.nonce,
    };

    await next();
  };
}
