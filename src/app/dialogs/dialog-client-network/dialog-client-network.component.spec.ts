import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogClientNetworkComponent } from './dialog-client-network.component';

describe('DialogClientNetworkComponent', () => {
  let component: DialogClientNetworkComponent;
  let fixture: ComponentFixture<DialogClientNetworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogClientNetworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogClientNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
