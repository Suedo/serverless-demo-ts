import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { DynamoDB } from "aws-sdk";

import * as createError from "http-errors";

import { Auction, TaskStatus } from "../models/auction";
import { middify } from "../lib/commonMiddleware";
import { getAuctionById } from "./getAuction";

// static, so can stay in globalscope
const dynamodb = new DynamoDB.DocumentClient();

let placeBid: APIGatewayProxyHandler = async (event, _context) => {
  let updatedAuction;
  const { id } = event.pathParameters;
  const { amount } = event.body;

  // get existing auction
  const auction = await getAuctionById(id);

  // check for highest bid
  if (amount < auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than the current highest bid: ${auction.highestBid.amount}`,
    );
  }

  const updateParams = {
    TableName: process.env.AUCTIONS_TABE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW", // telling DynamoDB to only return newly created entries
  };

  try {
    const result = await dynamodb.update(updateParams).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};

export const handler = middify(placeBid);
