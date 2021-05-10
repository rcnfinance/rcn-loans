import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogChainSelectorComponent } from './dialog-chain-selector.component';

describe('DialogChainSelectorComponent', () => {
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  let component: DialogChainSelectorComponent;
  let fixture: ComponentFixture<DialogChainSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatDialogModule ],
      declarations: [ DialogChainSelectorComponent ],
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
    fixture = TestBed.createComponent(DialogChainSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
