import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from './../../material.module';
import { DialogWalletSelectComponent } from './dialog-wallet-select.component';
import { EventsService } from './../../services/events.service';

describe('DialogWalletSelectComponent', () => {
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  let component: DialogWalletSelectComponent;
  let fixture: ComponentFixture<DialogWalletSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MaterialModule, MatDialogModule ],
      declarations: [ DialogWalletSelectComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        EventsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWalletSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
