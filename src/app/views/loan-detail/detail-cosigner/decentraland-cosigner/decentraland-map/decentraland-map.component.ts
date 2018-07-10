import { Component, Input } from '@angular/core';
import { Parcel } from '../../../../../models/cosigners/decentraland-cosigner.model';
import { DecentralandCosignerProvider } from '../../../../../providers/cosigners/decentraland-cosigner-provider';

@Component({
  selector: 'app-decentraland-map',
  templateUrl: './decentraland-map.component.html',
  styleUrls: ['./decentraland-map.component.scss']
})
export class DecentralandMapComponent {
  @Input() decentralandProvider: DecentralandCosignerProvider;
  @Input() center: Parcel;
  @Input() public width;
  @Input() public height;
  public sizeBlock = 10;
  public margin = 2;

  constructor() { }

  resource(): string {
    return this.decentralandProvider.dataUrl + 'parcels/' +
      + this.center.x + '/' + this.center.y + '/map.png?' +
      'width=' + this.width +
      '&height=' + this.height;
  }
}
