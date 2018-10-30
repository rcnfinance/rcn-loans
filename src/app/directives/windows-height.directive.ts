import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appWindowsHeight]'
})
export class WindowsHeightDirective {
  screenHeight: any = (document.body.scrollHeight) + 'px';
  constructor() {
    this.screenHeight = (document.body.scrollHeight) + 'px';
  }
  @HostBinding ('style.height') height: any = this.screenHeight;
  @HostBinding ('style.minHeight') minHeight: any = '900px';

  @HostListener ('mouseenter') mouseover(eventData: Event) {}
  @HostListener ('mouseleave') mouseleave(eventData: Event) {}
}
