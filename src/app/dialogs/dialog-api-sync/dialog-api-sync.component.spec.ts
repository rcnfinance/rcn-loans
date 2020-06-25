import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from './../../material.module';
import { DialogApiSyncComponent } from './dialog-api-sync.component';

describe('DialogApiSyncComponent', () => {
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  let component: DialogApiSyncComponent;
  let fixture: ComponentFixture<DialogApiSyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MaterialModule, MatDialogModule ],
      declarations: [ DialogApiSyncComponent ],
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
    fixture = TestBed.createComponent(DialogApiSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
