import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getEndedAuctions } from '../lib/getEndedAuctions';

let processAuctions = async (event, _context) => {
  const auctionsToClose = await getEndedAuctions();
  console.log(auctionsToClose);
};

export const handler = processAuctions;
