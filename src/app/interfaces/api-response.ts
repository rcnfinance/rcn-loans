export interface ApiResponse {
  content: any;
  meta: {
    last_block_processed?: number;
    count?: number;
    page?: number;
    page_size?: number;
    engine_name?: ApiEngine;
  };
}

export enum ApiEngine {
  RcnEngine = 'rcn_engine',
  UsdcEngine = 'usdc_engine'
}
