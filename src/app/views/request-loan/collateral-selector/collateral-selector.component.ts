import { Component, OnInit, Inject } from '@angular/core';
import { Web3Service } from '../../../services/web3.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AssetsService } from '../../../services/assets.service';
import { AssetType, AssetItem } from '../../../models/asset.model';

@Component({
  selector: 'app-collateral-selector',
  templateUrl: './collateral-selector.component.html',
  styleUrls: ['./collateral-selector.component.scss']
})
export class CollateralSelectorComponent implements OnInit {

  private available721 = [];
  private available20 = [];

  constructor(
    public dialogRef: MatDialogRef<CollateralSelectorComponent>,
    private assetsService: AssetsService,
    private web3Service: Web3Service,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  async ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
    const allTokens = await this.assetsService.allAssetsOf(await this.web3Service.getAccount());
    this.available721 = allTokens.filter(t => t.asset.type === AssetType.ERC721);
    this.available20 = allTokens.filter(t => t.asset.type === AssetType.ERC20);
  }

  async onSubmit(event: any, formselect721: any) {
    event.preventDefault();
    // Request all approve transactions
    const selected721 = formselect721.options.filter(o => o.selected);
    const pendingTx = [];
    const result721 = [];
    for (const item of selected721) {
      const assetItem = this.available721.find(a => a.uuid === item.value) as AssetItem;
      pendingTx.push(this.assetsService.sendApprove(assetItem, this.data.pawnManager));
      result721.push(assetItem);
    }
    for (const ptx of pendingTx) {
      await ptx;
    }
    this.dialogRef.close(result721);
  }
}

