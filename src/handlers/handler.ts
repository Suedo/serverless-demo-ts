import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { v4 as uuid } from "uuid";
import { DynamoDB } from "aws-sdk";

import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
// const validator = require("@middy/validator");

import * as createError from "http-errors";

// static, so can stay in globalscope
const dynamodb = new DynamoDB.DocumentClient();

let create_Auction: APIGatewayProxyHandler = async (event, _context) => {
  // jsonBodyParser will aotomatically parse it for us
  const { title } = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABE_NAME,
        // needs to have the `id` key as defined in serverless.yml
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError();
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
};

export const createAuction = middy(create_Auction)
  .use(jsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
