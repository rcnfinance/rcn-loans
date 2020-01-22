import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PageHeaderComponent } from './page-header.component';
import { readComponent } from '../../utils/utils.test';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageHeaderComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title and description only', () => {
    const expectedTitle = 'Activity';
    const expectedDescription = 'Check the marketplace´s active loan';

    component.title = expectedTitle;
    component.description = expectedDescription;
    fixture.detectChanges();

    const title = readComponent(fixture, '.title');
    expect(title.innerText).toBe(expectedTitle.toUpperCase());

    const description = readComponent(fixture, '.subtitle');
    expect(description.innerText).toBe(expectedDescription);

    const chip = readComponent(fixture, '.mat-chip');
    expect(chip).toBeUndefined();
  });

  it('should display title, description and chip amount', () => {
    const expectedTitle = 'Activity';
    const expectedDescription = 'Check the marketplace´s active loan';
    const expectedChipValue = 15;
    const expectedChipLabel = 'ACTIVE';

    component.title = expectedTitle;
    component.description = expectedDescription;
    component.hasChip = true;
    component.chipValue = expectedChipValue;
    component.chipLabel = expectedChipLabel;
    fixture.detectChanges();

    const chip = readComponent(fixture, '.mat-chip');
    expect(chip).toBeDefined();
    expect(chip.innerText).toBe(`${ expectedChipValue } ${ expectedChipLabel}`);
  });
});
