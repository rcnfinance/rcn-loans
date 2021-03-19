import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPohComponent } from './dialog-poh.component';

describe('DialogPohComponent', () => {
  let component: DialogPohComponent;
  let fixture: ComponentFixture<DialogPohComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogPohComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPohComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
