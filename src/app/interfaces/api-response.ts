export interface ApiResponse {
  content: any[];
  meta: {
    // lastBlockPulled: string; // TODO: add
    count: number;
    page: number;
    page_size: number;
    engine_name?: ApiEngine;
  };
}

export enum ApiEngine {
  RcnEngine = 'rcn_engine',
  UsdcEngine = 'usdc_engine'
}
