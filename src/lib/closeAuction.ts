import { DynamoDB, SQS } from 'aws-sdk';
import { UpdateItemInput, AttributeValue } from 'aws-sdk/clients/dynamodb';
import { Auction, AuctionStatus } from '../models/auction';

const db = new DynamoDB.DocumentClient();
const sqs = new SQS();

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

  const { title, seller, highestBid } = auction;
  const { bidder, amount } = highestBid;

  // return if no bids placed
  if (amount === 0) {
    await sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: `No Bids for your Auction Item ${title}`,
          recipient: seller,
          body: `Timeout! your item ${title} has not found any bidders during the auction period`,
        }),
      })
      .promise();
    return;
  }

  const notifySeller = await sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'Your item has been sold',
        recipient: seller,
        body: `Congratulations! your item ${title} has been sold for ${amount}`,
      }),
    })
    .promise();

  const notifyBidder = await sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'Your won an Action',
        recipient: bidder,
        body: `Congratulations! you won the auction for ${title}, at a bid of $${amount}`,
      }),
    })
    .promise();

  return Promise.all([notifySeller, notifyBidder]);
};
