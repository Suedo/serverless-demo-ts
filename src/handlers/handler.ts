import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { v4 as uuid } from "uuid";
import { DynamoDB } from "aws-sdk";

// static, so can stay in globalscope
const dynamodb = new DynamoDB.DocumentClient();

export const createAuction: APIGatewayProxyHandler = async (
  event,
  _context,
) => {
  const { title } = JSON.parse(event.body);
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
  };

  await dynamodb
    .put({
      TableName: process.env.AUCTIONS_TABE_NAME,
      // needs to have the `id` key as defined in serverless.yml
      Item: auction,
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
};
