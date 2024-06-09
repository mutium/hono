import { Hono } from "hono";
import {
  errorHandle,
  notFound,
  ErrorHandleExceptionHandleOption,
  NotFoundExceptionHandleOption,
} from "./infrastructure";

export type BuilderFn = { (app: Hono): void };
export type BuilderFnAsync = { (app: Hono): Promise<void> };

type BootstrapBuilderOption = {
  beforeBuilder?: BuilderFn | BuilderFnAsync;
  afterBuilder?: BuilderFn | BuilderFnAsync;
  errorHandleOption?: ErrorHandleExceptionHandleOption;
  notFoundHandleOption?: NotFoundExceptionHandleOption;
};

type HonoAppBuilder = {
  configure(builderOption?: BootstrapBuilderOption): HonoAppBuilder;
  build(): Promise<Hono>;
};

export function createHonoApp(): HonoAppBuilder {
  const app = new Hono();
  const nextConfiguration: {} & BootstrapBuilderOption = {};

  return {
    configure(builderOption) {
      nextConfiguration.afterBuilder = builderOption?.afterBuilder;
      nextConfiguration.beforeBuilder = builderOption?.beforeBuilder;
      nextConfiguration.errorHandleOption = builderOption?.errorHandleOption;
      nextConfiguration.notFoundHandleOption =
        builderOption?.notFoundHandleOption;

      return this;
    },
    async build() {
      if (nextConfiguration?.beforeBuilder) {
        const beforeBuilderResult = nextConfiguration.beforeBuilder(app);

        if (beforeBuilderResult instanceof Promise) await beforeBuilderResult;
      }

      app.onError(errorHandle(nextConfiguration?.errorHandleOption));
      app.notFound(notFound(nextConfiguration?.notFoundHandleOption));

      if (nextConfiguration?.afterBuilder) {
        const afterBuilderResult = nextConfiguration.afterBuilder(app);

        if (afterBuilderResult instanceof Promise) await afterBuilderResult;
      }

      return app;
    },
  };
}
