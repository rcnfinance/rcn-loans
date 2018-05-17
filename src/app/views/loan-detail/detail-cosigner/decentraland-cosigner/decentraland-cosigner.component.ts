import { Component, OnInit, Input } from '@angular/core';
import { DecentralandCosigner, District, Tag } from '../../../../models/cosigners/decentraland-cosigner.model';
import { Loan } from '../../../../models/loan.model';
import { DecentralandCosignerService } from '../../../../services/cosigners/decentraland-cosigner.service';

@Component({
  selector: 'app-decentraland-cosigner',
  templateUrl: './decentraland-cosigner.component.html',
  styleUrls: ['./decentraland-cosigner.component.scss']
})
export class DecentralandCosignerComponent implements OnInit {
  constructor(
    private decentraland: DecentralandCosignerService
  ) { }

  @Input() cosigner: DecentralandCosigner;
  districtsData: District[];
  ngOnInit() {
    this.decentraland.getDistricts().then((districts) => {
      this.districtsData = districts;
    });
  }
  highlightTitle(tag: Tag): string {
    if (this.districtsData === undefined) {
      return '...'; // Loading districts data
    }

    const candidate = this.districtsData.find(d => d.id === tag.district_id);
    if (candidate !== undefined) {
      return candidate.name;
    } else {
      return 'Unknown';
    }
  }
  highlightIcon(tag: Tag): string {
    switch (tag.district_id) {
      case 'f77140f9-c7b4-4787-89c9-9fa0e219b079':
        return 'https://market.decentraland.org/static/media/road-icon.1be1f581.svg';
      default:
        return 'https://market.decentraland.org/static/media/district-icon.a9852260.svg';
    }
  }
  highlightDistance(tag: Tag): string {
    if (tag.distance === 0) {
      return 'part of';
    } else if (tag.distance === 1) {
      return tag.distance + ' parcel away';
    } else {
      return tag.distance + ' parcels away';
    }
  }
}
