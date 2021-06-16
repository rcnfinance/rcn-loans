import { Component, OnInit } from '@angular/core';
import { ChainService } from 'app/services/chain.service';
import { Web3Service } from 'app/services/web3.service';

@Component({
  selector: 'app-dialog-chain-selector',
  templateUrl: './dialog-chain-selector.component.html',
  styleUrls: ['./dialog-chain-selector.component.scss']
})
export class DialogChainSelectorComponent implements OnInit {
  chains: {
    id: number;
    name: string;
    image: string;
    website: string;
    active?: boolean;
  }[];

  constructor(
    private web3Service: Web3Service,
    private chainService: ChainService
  ) { }

  ngOnInit() {
    const chainsData = [];
    const { chains, chain } = this.chainService;

    chains.map((chainId) => {
      const { network } = this.chainService.getChainConfigById(chainId);
      const { id } = network;
      const { name, image, website } = network.ui;
      const active = chain === id;
      chainsData.push({ id, name, image, website, active });
    });

    this.chains = chainsData;
  }

  get currentChain() {
    return this.chainService.chain;
  }

  /**
   * Requeust network change
   * @param chain Selected chain
   * @param connected Currently connected
   */
  async selectChain({ id }, connected?: boolean) {
    if (connected) {
      return;
    }

    const { network } = this.chainService.getChainConfigById(id);
    const { web3 } = this.web3Service;
    const addEthereumChain = {
      chainId: web3.utils.toHex(id),
      chainName: network.ui.name,
      nativeCurrency: {
        name: network.currency,
        symbol: network.currency,
        decimals: 18
      },
      rpcUrls: [network.provider.url]
    };

    try {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [addEthereumChain]
      });

      this.chains.map((chain) => {
        chain.active = id === chain.id;
        return chain;
      });
    } catch ({ code }) {
      if (code === -32602) {
        // TODO: must manually change the network (default networks aren't supported)
      }
    }
  }
}
