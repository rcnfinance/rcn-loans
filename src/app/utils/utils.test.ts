import {} from 'jasmine';

import { ComponentFixture } from '@angular/core/testing';

export function readComponent(e: ComponentFixture<any>, s: string, i = 0): HTMLElement {
  const r = e.debugElement.nativeElement.querySelectorAll(s);
  return r[i];
}
