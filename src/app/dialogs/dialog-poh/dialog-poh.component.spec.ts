import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'app/material.module';
import { EventsService } from 'app/services/events.service';
import { DialogPohComponent } from './dialog-poh.component';

describe('DialogPohComponent', () => {
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  let component: DialogPohComponent;
  let fixture: ComponentFixture<DialogPohComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule, MaterialModule, MatDialogModule ],
      declarations: [ DialogPohComponent ],
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
    fixture = TestBed.createComponent(DialogPohComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
