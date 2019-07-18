import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CircleProgressComponent } from './circle-progress.component';

describe('CircleProgressComponent', () => {
  let component: CircleProgressComponent;
  let fixture: ComponentFixture<CircleProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CircleProgressComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
