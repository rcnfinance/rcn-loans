import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule, MatDialogModule } from '@angular/material';
import { ChainSelectorComponent } from './chain-selector.component';

describe('ChainSelectorComponent', () => {
  let component: ChainSelectorComponent;
  let fixture: ComponentFixture<ChainSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatDialogModule, MatTooltipModule ],
      declarations: [ ChainSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
