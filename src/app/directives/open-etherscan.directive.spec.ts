import { OpenEtherscanDirective } from './open-etherscan.directive';
import { ChainService } from './../services/chain.service';
import { Web3Service } from './../services/web3.service';

describe('OpenEtherscanDirective', () => {
  let directive: OpenEtherscanDirective;

  it('should create an instance', () => {
    directive = new OpenEtherscanDirective(ChainService[0], Web3Service[0]);
    expect(directive).toBeTruthy();
  });
});
