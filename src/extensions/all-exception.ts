import { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { ProblemDocument } from "http-problem-details";

export const errorHandle = ((e, ctx) => {
  if (e instanceof ZodError) {
    return ctx.json(
      new ProblemDocument({
        detail: "Complete request parameters not provided",
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
      detail: "Unknown error please contact to admin",
      instance: ctx.req.path,
      status: StatusCodes.BAD_REQUEST,
    }),
    StatusCodes.SERVICE_UNAVAILABLE
  );
}) as ErrorHandler;

export const notFound = ((ctx) =>
  ctx.json(
    new ProblemDocument({
      detail: "Not found",
      instance: ctx.req.path,
      status: StatusCodes.NOT_FOUND,
    }),
    StatusCodes.NOT_FOUND
  )) as NotFoundHandler;
