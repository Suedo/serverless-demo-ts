import { DynamoDB } from 'aws-sdk';
import { QueryInput } from 'aws-sdk/clients/dynamodb';
import { TaskStatus } from '../models/auction';

const dynamodb = new DynamoDB.DocumentClient();

export const getEndedAuctions = async () => {
  const now = new Date();

  const params: QueryInput = {
    TableName: process.env.AUCTIONS_TABE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :now',
    // 'status' is a reserved word, so we cannot simply use it in our query, hence prefixing with #
    // ExpressionAttributeNames is then used to replace #status with the name of attribute at runtime
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    // TS complains, but this is the correct way of writing it
    ExpressionAttributeValues: {
      ':status': TaskStatus.OPEN,
      ':now': now.toISOString(),
    },
  };

  const result = await dynamodb.query(params).promise();
  return result.Items;
};

/*
Typescript wise, this is correct, but it interprets `:status` and `:now` as Map.
https://forums.aws.amazon.com/thread.jspa?threadID=218483

    ExpressionAttributeValues: {
      ':status': {
        S: TaskStatus.OPEN,
      },
      ':now': {
        S: now.toISOString(),
      },
    },
*/
