export class Auction {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: Date;
  highestBid: Bid;
}

export enum TaskStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export class Bid {
  amount: number = 0;
}
