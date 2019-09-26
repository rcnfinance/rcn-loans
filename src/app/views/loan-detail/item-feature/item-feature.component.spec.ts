import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemFeatureComponent } from './item-feature.component';

describe('ItemFeatureComponent', () => {
  let component: ItemFeatureComponent;
  let fixture: ComponentFixture<ItemFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemFeatureComponent ]
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
