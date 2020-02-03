import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { NotificationItemComponent } from './../notification-item/notification-item.component';
import { Notification } from '../../../../models/notification.model';
import { readComponent } from '../../../../utils/utils.test';

describe('NotificationItemComponent', () => {
  let component: NotificationItemComponent;
  let fixture: ComponentFixture<NotificationItemComponent>;
  const notification: Notification = {
    'hashTx': '0x36b3cd4cae26afb849b764a70e621571635582675decff8d5acce0d65ae2f3c4',
    'starringEvent': '0xc78a11c729275e656fa3decc1f15aebee69d08fc',
    'starringEventShort': '0xc7...08fc',
    'time': 1562970021337,
    'confirmedTx': true,
    'txObject': {
      'id': '0x6a360f4f8d247543789c3ca447a5ef7a5a8c7b386a95774da2551e5385bfe131',
      'title': 'Lent',
      'message': 'the loan',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'awesomeClass': '',
      'color': 'blue'
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        SharedModule
      ],
      declarations: [
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
    fixture = TestBed.createComponent(NotificationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a notification', () => {
    component.notification = notification;
    fixture.detectChanges();

    const notificationElement = readComponent(fixture, '.notification-container');
    expect(notificationElement).toBeDefined();
  });

  it('should format time to delta', () => {
    let timestamp: number;
    let deltaTime: string;

    timestamp = new Date().getTime();
    deltaTime = component.toDeltaFormatted(timestamp);
    expect(deltaTime).toBe('Just now');

    timestamp = new Date().getTime() - 604800;
    deltaTime = component.toDeltaFormatted(timestamp);
    expect(deltaTime).toBe('10 Minutes');
  });

});
