import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ChainService } from 'app/services/chain.service';
import { DialogChainSelectorComponent } from 'app/dialogs/dialog-chain-selector/dialog-chain-selector.component';

@Component({
  selector: 'app-chain-selector',
  templateUrl: './chain-selector.component.html',
  styleUrls: ['./chain-selector.component.scss']
})
export class ChainSelectorComponent {
  constructor(
    private dialog: MatDialog,
    private chainService: ChainService
  ) { }

  get chain() {
    return this.chainService.chain;
  }

  get config() {
    return this.chainService.config;
  }

  get chainName() {
    return this.config.network.ui.fullname;
  }

  /**
   * Click on the selector to open an explanatory dialog
   */
  clickChainSelector() {
    this.dialog.open(DialogChainSelectorComponent);
  }
}
