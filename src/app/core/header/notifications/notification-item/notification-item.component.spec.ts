import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../material/material.module';
import { NotificationItemComponent } from './../notification-item/notification-item.component';

describe('NotificationItemComponent', () => {
  let component: NotificationItemComponent;
  let fixture: ComponentFixture<NotificationItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        MaterialModule
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
});
