import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogClientInstructionsComponent } from './dialog-client-instructions.component';

describe('DialogClientInstructionsComponent', () => {
  let component: DialogClientInstructionsComponent;
  let fixture: ComponentFixture<DialogClientInstructionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogClientInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogClientInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
