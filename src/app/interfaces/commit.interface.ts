export interface Commit {
  opcode: string;
  timestamp: number;
  order: number;
  proof: string;
  data: object;
}
