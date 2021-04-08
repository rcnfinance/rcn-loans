import { Directive, Input, HostListener } from '@angular/core';
import { ChainService } from 'app/services/chain.service';
import { Web3Service } from 'app/services/web3.service';

@Directive({
  selector: '[appOpenEtherscan]'
})
export class OpenEtherscanDirective {

  @Input() address: string;
  @Input() tx: string;

  constructor(
    private chainService: ChainService,
    private web3Service: Web3Service
  ) { }

  /**
   * Open the address or tx hash in etherscan
   */
  @HostListener('document:click', ['$event'])
  open() {
    const web3 = this.web3Service.web3;
    const { address, tx } = this;
    const { config } = this.chainService;

    // open tx
    if (tx) {
      window.open(
        config.network.explorer.tx.replace('${tx}', tx),
        '_blank'
      );
      return;
    }

    // open address
    if (address && web3.utils.isAddress(address)) {
      window.open(
        config.network.explorer.address.replace('${address}', address),
        '_blank'
      );
    }
    return;
  }

}
