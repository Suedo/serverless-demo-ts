import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { DynamoDB } from 'aws-sdk';

import * as createError from 'http-errors';

import { Auction, AuctionStatus } from '../models/auction';
import { middify } from '../lib/commonMiddleware';
import { getAuctionById } from './getAuction';

// static, so can stay in globalscope
const dynamodb = new DynamoDB.DocumentClient();

let placeBid: APIGatewayProxyHandler = async (event, _context) => {
  let updatedAuction;
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const { email } = event.requestContext.authorizer;

  // get existing auction
  const auction = await getAuctionById(id);

  if (auction.status == AuctionStatus.CLOSED) {
    throw new createError.Forbidden('Auction is closed, cannot place bid');
  }

  if (auction.seller === email) {
    throw new createError.Forbidden('You cannot bid on your own auctions!');
  }

  if (email === auction.highestBid.bidder) {
    throw new createError.Forbidden('You are already Highest Bidder');
  }

  if (amount < auction.highestBid.amount) {
    // check for highest bid
    throw new createError.Forbidden(
      `Your bid must be higher than the current highest bid: ${auction.highestBid.amount}`,
    );
  }

  const updateParams = {
    TableName: process.env.AUCTIONS_TABE_NAME,
    Key: { id },
    UpdateExpression:
      'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email,
    },
    ReturnValues: 'ALL_NEW', // telling DynamoDB to only return newly created entries
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
