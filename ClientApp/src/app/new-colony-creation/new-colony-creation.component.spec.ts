import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewColonyCreationComponent } from './new-colony-creation.component';

describe('NewHiveCreationComponent', () => {
  let component: NewColonyCreationComponent;
  let fixture: ComponentFixture<NewColonyCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewColonyCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewColonyCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
