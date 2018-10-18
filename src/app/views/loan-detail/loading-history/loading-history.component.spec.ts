import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingHistoryComponent } from './loading-history.component';

describe('LoadingHistoryComponent', () => {
  let component: LoadingHistoryComponent;
  let fixture: ComponentFixture<LoadingHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
