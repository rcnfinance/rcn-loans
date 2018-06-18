import { Component, Input } from '@angular/core';
import { Parcel } from '../../../../../models/cosigners/decentraland-cosigner.model';
import { DecentralandCosignerService } from '../../../../../services/cosigners/decentraland-cosigner.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-decentraland-map',
  templateUrl: './decentraland-map.component.html',
  styleUrls: ['./decentraland-map.component.scss']
})
export class DecentralandMapComponent {
  @Input() center: Parcel;
  @Input() public width;
  @Input() public height;
  public sizeBlock = 10;
  public margin = 2;

  constructor(
    private decentralandService: DecentralandCosignerService
  ) { }

  resource(): string {
    return environment.decentralandUrl + 'api/map.png?publications=true' +
      '&width=' + this.width +
      '&height=' + this.height +
      '&center=' + this.center.x + ',' + this.center.y +
      '&selected=' + this.center.x + ',' + this.center.y;
  }
}
