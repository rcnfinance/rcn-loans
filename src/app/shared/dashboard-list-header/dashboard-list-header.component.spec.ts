import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardListHeaderComponent } from './dashboard-list-header.component';

describe('DashboardListHeaderComponent', () => {
  let component: DashboardListHeaderComponent;
  let fixture: ComponentFixture<DashboardListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
