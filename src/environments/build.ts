import { BUILD } from './build-info';

export function getBuild(): string {
  return BUILD !== undefined && BUILD['suffix'] !== undefined ? BUILD['suffix'] : 'dev-build';
}
