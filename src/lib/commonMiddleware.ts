import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
// const validator = require("@middy/validator");

export const middify = (handler) =>
  middy(handler)
    .use(jsonBodyParser())
    .use(httpEventNormalizer())
    .use(httpErrorHandler());
