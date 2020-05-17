import { DynamoDB } from 'aws-sdk';
import { UpdateItemInput, AttributeValue } from 'aws-sdk/clients/dynamodb';
import { Auction, AuctionStatus } from '../models/auction';

const db = new DynamoDB.DocumentClient();

export const closeAuction = async (auction: Auction) => {
  const params: UpdateItemInput = {
    TableName: process.env.AUCTIONS_TABE_NAME,
    Key: {
      id: auction.id as AttributeValue,
    },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': AuctionStatus.CLOSED as AttributeValue,
    },
  };

  const result = await db.update(params).promise();
  return result;
};
