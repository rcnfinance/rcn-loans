import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from './../../material.module';
import { DialogFrontRunningComponent } from './dialog-front-running.component';

describe('DialogFrontRunningComponent', () => {
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  let component: DialogFrontRunningComponent;
  let fixture: ComponentFixture<DialogFrontRunningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MaterialModule, MatDialogModule ],
      declarations: [ DialogFrontRunningComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }
      ]
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
