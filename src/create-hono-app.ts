import {
  ErrorHandleExceptionHandleOption,
  NotFoundExceptionHandleOption,
} from "./extensions/all-exception";
import { Hono } from "hono";
import { errorHandle, notFound } from "./extensions";

export type BuilderFn = { (app: Hono): Promise<void> };

interface BootstrapBuilderOption {
  beforeDefaultBuilder?: BuilderFn;
  afterDefaultBuilder?: BuilderFn;
  errorHandleOption?: ErrorHandleExceptionHandleOption;
  notFoundHandleOption?: NotFoundExceptionHandleOption;
}

type HonoAppBuilder = {
  bootstrap(builderOption?: BootstrapBuilderOption): Promise<HonoAppBuilder>;
  build(): Hono;
};

export function createHonoApp(): HonoAppBuilder {
  const app = new Hono();

  return {
    async bootstrap(builderOption) {
      await builderOption?.beforeDefaultBuilder?.(app);
      app.onError(errorHandle(builderOption?.errorHandleOption));
      app.notFound(notFound(builderOption?.notFoundHandleOption));
      await builderOption?.afterDefaultBuilder?.(app);

      return this;
    },
    build() {
      return app;
    },
  };
}
