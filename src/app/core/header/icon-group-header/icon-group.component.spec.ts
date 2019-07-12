import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material/material.module';
import { SharedModule } from '../../../shared/shared.module';
import { IconGroupHeaderComponent } from './icon-group-header.component';
import { NotificationsComponent } from './../notifications/notifications.component';
import { NotificationItemComponent } from './../notifications/notification-item/notification-item.component';
import { NotificationsService } from '../../../services/notifications.service';

describe('IconGroupHeaderComponent', () => {
  let component: IconGroupHeaderComponent;
  let fixture: ComponentFixture<IconGroupHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule,
        MaterialModule,
        SharedModule
      ],
      declarations: [
        IconGroupHeaderComponent,
        NotificationsComponent,
        NotificationItemComponent
      ],
      providers: [
        NotificationsService
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
});
