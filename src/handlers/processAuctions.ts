import * as createError from 'http-errors';
import 'source-map-support/register';
import { getEndedAuctions } from '../lib/getEndedAuctions';
import { closeAuction } from '../lib/closeAuction';
import { Auction } from '../models/auction';

let processAuctions = async (event, _context) => {
  try {
    const auctionsToClose = await getEndedAuctions();
    const auctionClosePromises = auctionsToClose.map((auction) =>
      closeAuction(auction as Auction),
    );
    await Promise.all(auctionClosePromises); // wait for all the promises to resolve

    return {
      closed: auctionClosePromises.length,
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
};

export const handler = processAuctions;
