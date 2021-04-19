import { Component, OnInit } from '@angular/core';
import { ChainService } from 'app/services/chain.service';

@Component({
  selector: 'app-dialog-chain-selector',
  templateUrl: './dialog-chain-selector.component.html',
  styleUrls: ['./dialog-chain-selector.component.scss']
})
export class DialogChainSelectorComponent implements OnInit {
  chains: {
    id: number;
    fullname: string;
    image: string;
    website: string;
  }[];

  constructor(
    private chainService: ChainService
  ) { }

  ngOnInit() {
    const chainsData = [];
    const { chains } = this.chainService;

    chains.map((chainId) => {
      const { network } = this.chainService.getChainConfigById(chainId);
      const { id } = network;
      const { fullname, image, website } = network.ui;
      chainsData.push({ id, fullname, image, website });
    });

    this.chains = chainsData;
  }

  get currentChain() {
    return this.chainService.chain;
  }
}
