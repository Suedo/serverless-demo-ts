export class Auction {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: Date;
}

export enum TaskStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}
