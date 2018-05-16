import { Component, OnInit, Input } from '@angular/core';
import { DecentralandCosigner, District } from '../../../../models/cosigners/decentraland-cosigner.model';
import { Loan } from '../../../../models/loan.model';

@Component({
  selector: 'app-decentraland-cosigner',
  templateUrl: './decentraland-cosigner.component.html',
  styleUrls: ['./decentraland-cosigner.component.scss']
})
export class DecentralandCosignerComponent implements OnInit {
  constructor() { }
  @Input() cosigner: DecentralandCosigner;
  ngOnInit() {
  }
}
