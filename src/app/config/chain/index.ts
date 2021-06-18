import * as ethMainnet from './1';
import * as ethRopsten from './3';
import * as bscTestnet from './97';
import * as bscMainnet from './56';
import * as maticMainnet from './137';
import * as maticTestnet from './80001';
import { AvailableChains } from './../../interfaces/chain';

export default {
  [AvailableChains.EthMainnet]: ethMainnet,
  [AvailableChains.EthRopsten]: ethRopsten,
  [AvailableChains.BscTestnet]: bscTestnet,
  [AvailableChains.BscMainnet]: bscMainnet,
  [AvailableChains.MaticMainnet]: maticMainnet,
  [AvailableChains.MaticTestnet]: maticTestnet
};
