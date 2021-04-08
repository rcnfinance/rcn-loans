import { Component } from '@angular/core';
import { ChainService } from 'app/services/chain.service';

@Component({
  selector: 'app-chain-selector',
  templateUrl: './chain-selector.component.html',
  styleUrls: ['./chain-selector.component.scss']
})
export class ChainSelectorComponent {
  constructor(
    private chainService: ChainService
  ) { }

  get chain() {
    return this.chainService.chain;
  }

  get config() {
    return this.chainService.config;
  }
}
