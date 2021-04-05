import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './../../../shared/shared.module';
import { WalletSettingsComponent } from './wallet-settings.component';

describe('WalletSettingsComponent', () => {
  let component: WalletSettingsComponent;
  let fixture: ComponentFixture<WalletSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ BrowserAnimationsModule, HttpClientModule, SharedModule ],
      declarations: [ WalletSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
