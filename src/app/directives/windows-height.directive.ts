import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appWindowsHeight]'
})
export class WindowsHeightDirective {
  screenHeight: any = (document.body.scrollHeight) + 'px';
  constructor() {
    this.screenHeight = (document.body.scrollHeight) + 'px';
    console.log(this.screenHeight);
  }
  @HostBinding ('style.height') height: any = this.screenHeight;
  @HostBinding ('style.minHeight') minHeight: any = '900px';

  @HostListener ('mouseenter') mouseover(eventData: Event) {
    // this.height = '900px';
  }
  @HostListener ('mouseleave') mouseleave(eventData: Event) {
    // this.height = '3000px';
  }


}
