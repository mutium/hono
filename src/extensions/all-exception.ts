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
};

export function errorHandle(
  exceptionHandleOption: ExceptionHandleOption = {
    development() {},
    messageConstants: {},
  }
) {
  if (exceptionHandleOption) {
  }

  const { development, messageConstants } = exceptionHandleOption;
  const _messageConstants = defu(messageConstants, detailMessage);

  return ((e, ctx) => {
    development?.();

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
  exceptionHandleOption: ExceptionHandleOption = {
    development() {},
    messageConstants: {},
  }
) {
  const { development, messageConstants } = exceptionHandleOption;
  const _messageConstants = defu(messageConstants, detailMessage);

  return ((ctx) => {
    development?.();

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
