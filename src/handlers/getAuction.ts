import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { DynamoDB } from "aws-sdk";

import * as createError from "http-errors";

import { Auction, TaskStatus } from "../models/auction";
import { middify } from "../lib/commonMiddleware";

// static, so can stay in globalscope
const dynamodb = new DynamoDB.DocumentClient();

let getAuction: APIGatewayProxyHandler = async (event, _context) => {
  let auction;
  const { id } = event.pathParameters;

  try {
    const result = await dynamodb
      .get({ TableName: process.env.AUCTIONS_TABE_NAME, Key: { id } })
      .promise();

    auction = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID ${id} was not found`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

export const byID = middify(getAuction);
