import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { DetailHistoryComponent } from './detail-history.component';
import { SharedModule } from './../../../shared/shared.module';
import { FormatAmountPipe } from './../../../pipes/format-amount.pipe';

describe('DetailHistoryComponent', () => {
  let component: DetailHistoryComponent;
  let fixture: ComponentFixture<DetailHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule, SharedModule ],
      declarations: [ DetailHistoryComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [ FormatAmountPipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
