import { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { ProblemDocument } from "http-problem-details";
import { DetailMessage, detailMessage } from "./constants";
import defu from "defu";

type ExceptionHandleOption = {
  development?(): void;
  messageConstants?: Partial<DetailMessage>;
  extensions?: ErrorHandler;
};
export type ErrorHandleExceptionHandleOption = ExceptionHandleOption;
export type NotFoundExceptionHandleOption = Omit<
  ExceptionHandleOption,
  "extensions"
>;

export function errorHandle(
  exceptionHandleOption?: ErrorHandleExceptionHandleOption
) {
  const _messageConstants = defu(
    exceptionHandleOption?.messageConstants,
    detailMessage
  );

  return ((e, ctx) => {
    exceptionHandleOption?.development?.();
    const resp = exceptionHandleOption?.extensions?.(e, ctx);

    if (resp) return resp;

    if (e instanceof ZodError) {
      return ctx.json(
        new ProblemDocument({
          detail: _messageConstants["Complete request parameters not provided"],
          instance: ctx.req.path,
          status: StatusCodes.BAD_REQUEST,
        }),
        StatusCodes.BAD_REQUEST
      );
    }

    if (e instanceof HTTPException) {
      return ctx.json(
        new ProblemDocument({
          detail: e.message,
          instance: ctx.req.path,
          status: e.status,
        }),
        e.status
      );
    }

    return ctx.json(
      new ProblemDocument({
        detail: _messageConstants["Unknown error please contact to admin"],
        instance: ctx.req.path,
        status: StatusCodes.BAD_REQUEST,
      }),
      StatusCodes.SERVICE_UNAVAILABLE
    );
  }) as ErrorHandler;
}

export function notFound(
  exceptionHandleOption?: NotFoundExceptionHandleOption
) {
  const _messageConstants = defu(
    exceptionHandleOption?.messageConstants,
    detailMessage
  );

  return ((ctx) => {
    exceptionHandleOption?.development?.();

    return ctx.json(
      new ProblemDocument({
        detail: _messageConstants["Not found"],
        instance: ctx.req.path,
        status: StatusCodes.NOT_FOUND,
      }),
      StatusCodes.NOT_FOUND
    );
  }) as NotFoundHandler;
}
