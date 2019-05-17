import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWrongCountryComponent } from './dialog-wrong-country.component';

describe('DialogWrongCountryComponent', () => {
  let component: DialogWrongCountryComponent;
  let fixture: ComponentFixture<DialogWrongCountryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogWrongCountryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWrongCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
