import * as ethMainnet from './1';
import * as ethRopsten from './3';
import { AvailableChains } from './../../interfaces/chain';

export default {
  [AvailableChains.EthMainnet]: ethMainnet,
  [AvailableChains.EthRopsten]: ethRopsten
};
