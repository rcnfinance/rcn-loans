import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { IconGroupHeaderComponent } from './icon-group-header.component';
import { NotificationsService } from '../../../services/notifications.service';

describe('IconGroupHeaderComponent', () => {
  let component: IconGroupHeaderComponent;
  let fixture: ComponentFixture<IconGroupHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule,
        SharedModule
      ],
      declarations: [
        IconGroupHeaderComponent
      ],
      providers: [
        NotificationsService
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconGroupHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true', () => {
    const view = 'notifications';
    component.viewDetail = view;
    expect(component.isDetail(view)).toBeTruthy();
  });

  it('should update counter', () => {
    const counter = 5;
    component.updateCounter(counter);
    expect(component.notificationsCounter).toEqual(counter);
  });
});
