import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { v4 as uuid } from 'uuid';
import { DynamoDB } from 'aws-sdk';

import * as createError from 'http-errors';

import { Auction, TaskStatus, Bid } from '../models/auction';
import { middify } from '../lib/commonMiddleware';

// static, so can stay in globalscope
const dynamodb = new DynamoDB.DocumentClient();

let createAuction: APIGatewayProxyHandler = async (event, _context) => {
  // jsonBodyParser will aotomatically parse it for us

  // eslint-disable-next-line
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  console.log(endDate);

  const auction: Auction = {
    id: uuid(),
    title,
    status: TaskStatus.OPEN,
    createdAt: now.toISOString(),
    // without this manual string conversion, DynamoDB would complain saying endingAt index type of string doesnt match:
    // message: 'One or more parameter values were invalid: Type mismatch for Index Key endingAt Expected: S Actual: M IndexName: statusAndEndDate',
    endingAt: endDate.toISOString(),
    highestBid: new Bid(),
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

export const handler = middify(createAuction);
