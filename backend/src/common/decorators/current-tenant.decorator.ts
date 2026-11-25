import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.tenant) return null;
    return data ? request.tenant[data] : request.tenant;
  },
);
