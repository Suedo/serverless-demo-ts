import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { DynamoDB } from 'aws-sdk';

import * as createError from 'http-errors';

import { Auction, AuctionStatus } from '../models/auction';
import { middify } from '../lib/commonMiddleware';

// static, so can stay in globalscope
const dynamodb = new DynamoDB.DocumentClient();

let getAuctions: APIGatewayProxyHandler = async (event, _context) => {
  let auctions;

  try {
    const result = await dynamodb
      .scan({ TableName: process.env.AUCTIONS_TABE_NAME })
      .promise();

    auctions = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
};

export const handler = middify(getAuctions);
