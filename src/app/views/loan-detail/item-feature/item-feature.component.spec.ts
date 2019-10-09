import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemFeatureComponent } from './item-feature.component';
import { VisualUrlPipe } from './../../../pipes/visual-url.pipe';

describe('ItemFeatureComponent', () => {
  let component: ItemFeatureComponent;
  let fixture: ComponentFixture<ItemFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ItemFeatureComponent,
        VisualUrlPipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
