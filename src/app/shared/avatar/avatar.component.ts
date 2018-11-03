import { Component, Input, OnChanges } from '@angular/core';
// App Component
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input() seed: string;
  @Input() size = 10;
  @Input() scale = 3;
  constructor() { }
  getBlockiesOptions(): Object {
    return { // All options are optional
      seed: this.seed, // seed used to generate icon data, default: random
      color: '#4155ff', // to manually specify the icon color, default: random
      bgcolor: '#333333', // choose a different background color, default: random
      size: this.size, // width/height of the icon in blocks, default: 8
      scale: this.scale, // width/height of each block in pixels, default: 4
      spotcolor: '#3444cc' // each pixel has a 13% chance of being of a third color,
      // default: random. Set to -1 to disable it. These "spots" create structures
      // that look like eyes, mouths and noses.
    };
  }
}
