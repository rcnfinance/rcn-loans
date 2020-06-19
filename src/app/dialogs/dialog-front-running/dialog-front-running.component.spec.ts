import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFrontRunningComponent } from './dialog-front-running.component';

describe('DialogFrontRunningComponent', () => {
  let component: DialogFrontRunningComponent;
  let fixture: ComponentFixture<DialogFrontRunningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogFrontRunningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogFrontRunningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
