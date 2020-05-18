import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import 'source-map-support/register';
import { DynamoDB } from 'aws-sdk';

import * as createError from 'http-errors';

import { Auction, AuctionStatus } from '../models/auction';
import { middify } from '../lib/commonMiddleware';
import { QueryInput } from 'aws-sdk/clients/dynamodb';

// static, so can stay in globalscope
const dynamodb = new DynamoDB.DocumentClient();

/* 
  gets all the auctions for the given status
  the standard 'get all auctions' is too expensive an operation 
*/
let getAuctions: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  _context,
) => {
  let auctions;

  const { status } = event.queryStringParameters;

  const queryParams: QueryInput = {
    TableName: process.env.AUCTIONS_TABE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': status,
    },
  };

  try {
    const result = await dynamodb.query(queryParams).promise();

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
