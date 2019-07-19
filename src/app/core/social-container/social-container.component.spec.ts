import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialContainerComponent } from './social-container.component';

describe('SocialContainerComponent', () => {
  let component: SocialContainerComponent;
  let fixture: ComponentFixture<SocialContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SocialContainerComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
