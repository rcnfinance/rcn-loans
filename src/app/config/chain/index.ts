import * as ethMainnet from './1';
import * as ethRopsten from './3';
import * as bscTestnet from './97';
import { AvailableChains } from './../../interfaces/chain';

export default {
  [AvailableChains.EthMainnet]: ethMainnet,
  [AvailableChains.EthRopsten]: ethRopsten,
  [AvailableChains.BscTestnet]: bscTestnet
};
