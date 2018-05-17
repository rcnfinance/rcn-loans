import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyListComponent } from './body-list.component';

describe('BodyListComponent', () => {
  let component: BodyListComponent;
  let fixture: ComponentFixture<BodyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BodyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
