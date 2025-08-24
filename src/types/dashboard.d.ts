export interface Request {
  id: number;
  service: string;
  client: string;
  status: "Pending" | "In Progress" | "Completed";
  date: string;
}
