import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LendButtonComponent } from './lend-button.component';

describe('LendButtonComponent', () => {
  let component: LendButtonComponent;
  let fixture: ComponentFixture<LendButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LendButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LendButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
