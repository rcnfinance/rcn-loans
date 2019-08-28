import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../../material/material.module';
import { SharedModule } from '../../../shared/shared.module';
import { CurrenciesService } from '../../../services/currencies.service';
import { CollateralService } from '../../../services/collateral.service';
import { DetailCollateralComponent } from './detail-collateral.component';

describe('DetailCollateralComponent', () => {
  let component: DetailCollateralComponent;
  let fixture: ComponentFixture<DetailCollateralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MaterialModule,
        SharedModule
      ],
      declarations: [
        DetailCollateralComponent
      ],
      providers: [
        CurrenciesService,
        CollateralService,
        {
          provide: APP_BASE_HREF, useValue: '/'
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCollateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
