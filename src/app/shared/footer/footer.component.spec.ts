import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../material.module';
import { FooterComponent } from './footer.component';
import { Web3Service } from './../../services/web3.service';
import { SidebarService } from './../../services/sidebar.service';
import { TitleService } from './../../services/title.service';
import { EventsService } from './../../services/events.service';
import { AvailableLoansService } from './../../services/available-loans.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        HttpClientModule,
        MaterialModule
      ],
      declarations: [ FooterComponent ],
      providers: [
        Web3Service,
        SidebarService,
        TitleService,
        EventsService,
        AvailableLoansService,
        {
          provide: APP_BASE_HREF, useValue: '/'
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
