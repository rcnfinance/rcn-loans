export interface ApiResponse {
  content: any[];
  meta: {
    // lastBlockPulled: string; // TODO: add
    count: number;
    page: number;
    page_size: number;
  };
}
