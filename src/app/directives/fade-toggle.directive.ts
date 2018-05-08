import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appFadeToggle]'
})
export class FadeToggleDirective {
  @HostBinding('class.fadeToggle') isToggled = false;

  @HostListener('click') toggleOpen() {
    this.isToggled = !this.isToggled;
  }
  constructor() { }
}
