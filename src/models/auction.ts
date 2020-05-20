export class Auction {
  id: string;
  title: string;
  status: AuctionStatus;
  createdAt: string;
  endingAt: string;
  highestBid: Bid;
  seller: string;
}

export enum AuctionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

export class Bid {
  amount: number = 0;
  bidder: string;
}
