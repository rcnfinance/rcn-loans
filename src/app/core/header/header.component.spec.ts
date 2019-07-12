import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material/material.module';
import { HeaderComponent } from './header.component';
import { IconGroupHeaderComponent } from './icon-group-header/icon-group-header.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationItemComponent } from './notifications/notification-item/notification-item.component';
import { BalanceComponent } from './../balance/balance.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        SharedModule,
        MaterialModule,
        HttpClientModule
      ],
      declarations: [
        HeaderComponent,
        BalanceComponent,
        IconGroupHeaderComponent,
        NotificationsComponent,
        NotificationItemComponent
      ],
      providers: [
        {
          provide: APP_BASE_HREF, useValue: '/'
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
