import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { Ad } from 'app/services/application-ads.service';
import { DialogChainSelectorComponent } from 'app/dialogs/dialog-chain-selector/dialog-chain-selector.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-fixed-application-ad',
  templateUrl: './fixed-application-ad.component.html',
  styleUrls: ['./fixed-application-ad.component.scss']
})
export class FixedApplicationAdComponent implements OnInit, AfterViewInit {
  @Input() ad: Ad;
  hidden: boolean;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const actionElement = document.getElementsByClassName('bind-action')[0];
    if (actionElement) {
      actionElement.addEventListener('click', this.openDialogChainSelector);
    }
  }

  private openDialogChainSelector = () => {
    this.dialog.open(DialogChainSelectorComponent, {
      panelClass: 'dialog-selector-wrapper'
    });
  }

}
