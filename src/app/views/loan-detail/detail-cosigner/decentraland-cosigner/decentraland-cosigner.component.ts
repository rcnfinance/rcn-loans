import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { District, Tag, DecentralandCosigner, Parcel } from '../../../../models/cosigners/decentraland-cosigner.model';
import { Loan, Status } from '../../../../models/loan.model';
import { DecentralandCosignerProvider } from '../../../../providers/cosigners/decentraland-cosigner-provider';
import { CosignerDetail, Cosigner } from '../../../../models/cosigner.model';
import { Utils } from '../../../../utils/utils';

@Component({
  selector: 'app-decentraland-cosigner',
  templateUrl: './decentraland-cosigner.component.html',
  styleUrls: ['./decentraland-cosigner.component.scss']
})
export class DecentralandCosignerComponent implements OnInit {
  @Input() loan: Loan;
  @Input() cosignerProvider: DecentralandCosignerProvider;
  detail: DecentralandCosigner;
  districtsData: District[];
  // View data
  parcel: Parcel = undefined;
  parcelId: string = undefined;
  displayPrice = '...';
  financiation = '...';
  highlights = [];
  constructor() { }
  ngOnInit() {
    this.cosignerProvider.getDistricts().then((districts) => {
      this.districtsData = districts;
    });

    if (this.loan.status === Status.Request) {
      this.cosignerProvider.offer(this.loan).then((cosigner) => {
        if (cosigner.cosignerDetail instanceof DecentralandCosigner) {
          this.detail = cosigner.cosignerDetail;
          this.renderDetail();
        }
      });
    } else {
      this.cosignerProvider.liability(this.loan).then((cosigner) => {
        if (cosigner.cosignerDetail instanceof DecentralandCosigner) {
          this.detail = cosigner.cosignerDetail;
          this.renderDetail();
        }
      });
    }
  }
  private renderDetail() {
    this.parcel = this.detail.parcel;
    this.parcelId = this.parcel.id;
    this.displayPrice = Utils.formatAmount(Number(this.detail.displayPrice));
    this.financiation = this.detail.financePart;
    this.highlights = this.parcel.highlights;
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
