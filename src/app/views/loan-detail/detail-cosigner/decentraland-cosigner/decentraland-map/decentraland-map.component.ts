import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Parcel } from '../../../../../models/cosigners/decentraland-cosigner.model';
import { DecentralandCosignerService } from '../../../../../services/cosigners/decentraland-cosigner.service';

@Component({
  selector: 'app-decentraland-map',
  templateUrl: './decentraland-map.component.html',
  styleUrls: ['./decentraland-map.component.scss']
})
export class DecentralandMapComponent implements OnInit {
  @ViewChild('mapCanvas') canvas: ElementRef;
  @Input() center: Parcel;

  public width = 340;
  public height = 200;
  public sizeBlock = 10;
  public margin = 2;

  constructor(
    private decentralandService: DecentralandCosignerService
  ) { }
  get widthBlocks(): number {
    return this.width / this.sizeBlock;
  }
  get heightBlocks(): number {
    return this.height / this.sizeBlock;
  }
  ngOnInit() {
    console.log('Draw map! center:', this.center);
    const width = this.widthBlocks;
    const coords: [number, number] = [this.center.x, this.center.y];
    const size: [number, number] = [width, this.heightBlocks];
    const top = this.center.x + size[0] / 2;
    const start = this.center.y + size[1] / 2;
    this.decentralandService.getParcelArea(coords, size).then((parcels: Parcel[]) => {
      const context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
      parcels.forEach(parcel => {
        const absolute_coords = this.absoluteCords(parcel, this.sizeBlock, width, top, start);
        context.fillStyle = this.getColor(parcel);
        const drawBlock = this.sizeBlock - this.getMargin(parcel);
        context.fillRect(absolute_coords[0], absolute_coords[1], drawBlock, drawBlock);
      });
    });
  }
  private getColor(parcel: Parcel): string {
    if (parcel.district_id === 'f77140f9-c7b4-4787-89c9-9fa0e219b079') {
      return '#8188a3';
    } else if (parcel.id === this.center.id) {
      return '#ff9990';
    } else if (parcel.district_id !== null) {
      return '#7772ff';
    } else if (parcel.owner === null) {
      return '#1c1e2e';
    } else {
      return '#505771';
    }
  }
  private getMargin(parcel: Parcel): number {
    if (parcel.district_id !== null) {
      return 0;
    } else {
      return 2;
    }
  }
  private absoluteCords(parcel: Parcel, size: number, width: number, top: number, start: number): [number, number] {
    return [(-1 * (top - parcel.x) + width) * size, (start - parcel.y) * size];
  }
}
