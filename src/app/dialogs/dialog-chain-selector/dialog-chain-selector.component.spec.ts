import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChainSelectorComponent } from './dialog-chain-selector.component';

describe('DialogChainSelectorComponent', () => {
  let component: DialogChainSelectorComponent;
  let fixture: ComponentFixture<DialogChainSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogChainSelectorComponent ]
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
