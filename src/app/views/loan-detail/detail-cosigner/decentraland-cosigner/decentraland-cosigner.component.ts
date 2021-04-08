import { Component, OnInit, Input } from '@angular/core';
import { District, Tag, DecentralandCosigner, Parcel } from 'app/models/cosigners/decentraland-cosigner.model';
import { Loan, Status } from 'app/models/loan.model';
import { DecentralandCosignerProvider } from 'app/providers/cosigners/decentraland-cosigner-provider';
import { Utils } from 'app/utils/utils';
import { ChainService } from 'app/services/chain.service';

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
  firstCoordenate: string = undefined;
  lastCoordenate: string = undefined;
  displayPrice = '...';
  financiation = '...';
  highlights = [];
  mortgageManager: string =
    this.chainService.config.contracts.decentraland.mortgageManager;
  status: string = undefined;

  // Decentraland Map DATA
  winWidth: number = window.innerWidth;
  mapWidth: number = undefined;
  mapHeight: number = undefined;

  constructor(
    private chainService: ChainService
  ) { }

  winSize() {
    if (this.winWidth < 550) {
      this.mapWidth = 400;
      this.mapHeight = 250;
    } else if (this.winWidth > 550 && this.winWidth < 992) {
      this.mapWidth = 960;
      this.mapHeight = 250;
    } else {
      this.mapWidth = 500;
      this.mapHeight = 200;
    }
  }
  highlightTitle(tag: Tag): string {
    if (this.districtsData === undefined) {
      return '...'; // Loading districts data
    }

    const candidate = this.districtsData.find(d => d.id === tag.districtId);

    if (candidate !== undefined) {
      return candidate.name;
    }

    return 'Unknown';
  }
  highlightIcon(tag: Tag): string {
    switch (tag.districtId) {
      case 'f77140f9-c7b4-4787-89c9-9fa0e219b079':
        return 'https://market.decentraland.org/static/media/road-icon.1be1f581.svg';
      default:
        return 'https://market.decentraland.org/static/media/district-icon.a9852260.svg';
    }
  }
  highlightDistance(tag: Tag): string {
    if (tag.distance === 0) {
      return 'Adjacent';
    }

    if (tag.distance === 1) {
      return tag.distance + ' parcel away';
    }

    return tag.distance + ' parcels away';
  }

  ngOnInit() {
    this.winSize();

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
    this.status = this.parcel.status;

    const coordenate = this.parcelId.split(',');
    this.firstCoordenate = coordenate[0];
    this.lastCoordenate = coordenate[1];
  }
}
