import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SharedModule } from './../../../shared/shared.module';
import { MyLoansTabsComponent } from './my-loans-tabs.component';

describe('MyLoansTabsComponent', () => {
  let component: MyLoansTabsComponent;
  let fixture: ComponentFixture<MyLoansTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule ],
      declarations: [ MyLoansTabsComponent ],
      providers: [
        {
          provide: APP_BASE_HREF, useValue: '/'
        },
        {
          provide: LocationStrategy,
          useClass: PathLocationStrategy
        },
        Location
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyLoansTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
