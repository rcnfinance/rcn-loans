import { OpenEtherscanDirective } from './open-etherscan.directive';
import { Web3Service } from './../services/web3.service';

describe('OpenEtherscanDirective', () => {
  let directive: OpenEtherscanDirective;

  it('should create an instance', () => {
    directive = new OpenEtherscanDirective(Web3Service[0]);
    expect(directive).toBeTruthy();
  });
});
