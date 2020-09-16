export interface ApiResponse {
  content: any[];
  meta: {
    lastBlockPulled: string;
    next: string;
    page: number;
    page_size: number;
    params: object;
    prev: string;
    resource_count: number;
  };
}
