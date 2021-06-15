import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ChainService } from 'app/services/chain.service';
import { DialogChainSelectorComponent } from 'app/dialogs/dialog-chain-selector/dialog-chain-selector.component';

@Component({
  selector: 'app-chain-selector',
  templateUrl: './chain-selector.component.html',
  styleUrls: ['./chain-selector.component.scss']
})
export class ChainSelectorComponent {

  @Input() isBridge = false;

  constructor(
    private dialog: MatDialog,
    private chainService: ChainService
  ) { }

  /**
   * Getter chain object
   */
  get chain() {
    return this.chainService.chain;
  }

  /**
   * Getter chain config
   */
  get config() {
    return this.chainService.config;
  }

  /**
   * Getter chainname
   */
  get chainName() {
    return this.config.network.ui.fullname;
  }

  /**
   * Click on the selector to open an explanatory dialog
   */
  clickChainSelector() {
    if (this.isBridge) return;
    this.dialog.open(DialogChainSelectorComponent);
  }
}
