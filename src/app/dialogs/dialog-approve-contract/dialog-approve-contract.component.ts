import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Engine } from './../../models/loan.model';

@Component({
  selector: 'app-dialog-approve-contract',
  templateUrl: './dialog-approve-contract.component.html',
  styleUrls: ['./dialog-approve-contract.component.scss']
})
export class DialogApproveContractComponent {
  DEFAULT_ENGINE = Engine.UsdcEngine;
  engine: Engine;
  onlyAddress: string;
  onlyToken: string;
  onlyAsset: string;

  dialogDescription: string; // TODO: implement
  startProgress: boolean;
  finishProgress: boolean;

  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<DialogApproveContractComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      engine: Engine;
      onlyAddress: string;
      onlyToken: string;
      onlyAsset: string;
    }
  ) {
    if (this.data) {
      const { DEFAULT_ENGINE } = this;
      const {
        engine,
        onlyAddress,
        onlyToken,
        onlyAsset
      } = this.data;
      this.engine = engine || DEFAULT_ENGINE;
      this.onlyAddress = onlyAddress;
      this.onlyToken = onlyToken;
      this.onlyAsset = onlyAsset;
    }
  }

  /**
   * Click on 'Cancel' or log-out
   */
  detectCloseDialog() {
    this.dialog.closeAll();
  }

  /**
   * Start progressbar
   */
  detectStartProgress() {
    this.startProgress = true;
  }

  /**
   * Finish progressbar
   */
  detectEndProgress() {
    this.finishProgress = true;
  }

  /**
   * Close dialog when the progressbar is full
   */
  finishApprove() {
    this.dialogRef.close(true);
  }

  /**
   * Set dialog description according to the token/asset used
   * @param description Dialog description
   */
  detectDialogDescription(description: string) {
    this.dialogDescription = description;
  }
}
