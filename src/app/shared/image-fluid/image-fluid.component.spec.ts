import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageFluidComponent } from './image-fluid.component';

describe('ImageFluidComponent', () => {
  let component: ImageFluidComponent;
  let fixture: ComponentFixture<ImageFluidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageFluidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageFluidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
