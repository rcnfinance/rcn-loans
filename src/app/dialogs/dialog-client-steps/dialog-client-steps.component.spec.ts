import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogClientStepsComponent } from './dialog-client-steps.component';

describe('DialogClientStepsComponent', () => {
  let component: DialogClientStepsComponent;
  let fixture: ComponentFixture<DialogClientStepsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogClientStepsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogClientStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
