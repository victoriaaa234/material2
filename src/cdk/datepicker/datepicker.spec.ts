import {
  dispatchFakeEvent,
} from '@angular/cdk/testing';
import {Component, FactoryProvider, Type, ValueProvider, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  DEC,
  JAN,
  JUL,
  JUN,
  MAT_DATE_LOCALE,
  NativeDateModule,
  SEP,
} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CdkDatepicker} from './datepicker';
import {CdkDatepickerInput} from './datepicker-input';
import {CdkDatepickerModule} from './index';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

describe('CdkDatepicker', () => {
  // Creates a test component fixture.
  function createComponent(
    component: Type<any>,
    imports: Type<any>[] = [],
    providers: (FactoryProvider | ValueProvider)[] = [],
    entryComponents: Type<any>[] = []): ComponentFixture<any> {

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        CdkDatepickerModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        ...imports
      ],
      providers,
      declarations: [component, ...entryComponents],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [entryComponents]
      }
    }).compileComponents();

    return TestBed.createComponent(component);
  }

  describe('with NativeDateModule', () => {
    describe('standard datepicker', () => {
      let fixture: ComponentFixture<StandardDatepicker>;
      let testComponent: StandardDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(StandardDatepicker, [NativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        fixture.detectChanges();
        flush();
      }));

      it('should initialize with correct value shown in input', () => {
        expect(fixture.nativeElement.querySelector('input').value).toBe('1/1/2020');
      });

      it('startAt should fallback to input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2020, JAN, 1));
      });

      it('should not throw when given wrong data type', () => {
        testComponent.date = '1/1/2017' as any;

        expect(() => fixture.detectChanges()).not.toThrow();
      });
    });

    describe('datepicker with too many inputs', () => {
      it('should throw when multiple inputs registered', fakeAsync(() => {
        let fixture = createComponent(MultiInputDatepicker, [NativeDateModule]);
        expect(() => fixture.detectChanges()).toThrow();
      }));
    });

    describe('datepicker with startAt', () => {
      let fixture: ComponentFixture<DatepickerWithStartAt>;
      let testComponent: DatepickerWithStartAt;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartAt, [NativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        fixture.detectChanges();
      }));

      it('explicit startAt should override input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2010, JAN, 1));
      });
    });

    describe('datepicker with ngModel', () => {
      let fixture: ComponentFixture<DatepickerWithNgModel>;
      let testComponent: DatepickerWithNgModel;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithNgModel, [NativeDateModule]);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          testComponent = fixture.componentInstance;
        });
      }));

      afterEach(fakeAsync(() => {
        fixture.detectChanges();
      }));

      it('should update datepicker when model changes', fakeAsync(() => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker._selected).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.selected = selected;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(testComponent.datepicker._selected).toEqual(selected);
      }));

      it('should mark input dirty after input event', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-dirty');
      });

      it('should not mark dirty after model change', fakeAsync(() => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.selected = new Date(2017, JAN, 1);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-pristine');
      }));

      it('should mark input touched on blur', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'focus');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-touched');
      });

      it('should not reformat invalid dates on blur', () => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        inputEl.value = 'very-valid-date';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.value).toBe('very-valid-date');
      });
    });

    describe('datepicker with formControl', () => {
      let fixture: ComponentFixture<DatepickerWithFormControl>;
      let testComponent: DatepickerWithFormControl;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithFormControl, [NativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        fixture.detectChanges();
      }));

      it('should update datepicker when formControl changes', () => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker._selected).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.formControl.setValue(selected);
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(testComponent.datepicker._selected).toEqual(selected);
      });

      it('should disable input when form control disabled', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(inputEl.disabled).toBe(true);
      });
    });

    describe('datepicker with min and max dates and validation', () => {
      let fixture: ComponentFixture<DatepickerWithMinAndMaxValidation>;
      let testComponent: DatepickerWithMinAndMaxValidation;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithMinAndMaxValidation, [NativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        fixture.detectChanges();
      }));

      it('should use min and max dates specified by the input', () => {
        expect(testComponent.datepicker._minDate).toEqual(new Date(2010, JAN, 1));
        expect(testComponent.datepicker._maxDate).toEqual(new Date(2020, JAN, 1));
      });

      it('should mark invalid when value is before min', fakeAsync(() => {
        testComponent.date = new Date(2009, DEC, 31);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
          .toContain('ng-invalid');
      }));

      it('should mark invalid when value is after max', fakeAsync(() => {
        testComponent.date = new Date(2020, JAN, 2);
        fixture.detectChanges();
        flush();

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
          .toContain('ng-invalid');
      }));

      it('should not mark invalid when value equals min', fakeAsync(() => {
        testComponent.date = testComponent.datepicker._minDate;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
          .not.toContain('ng-invalid');
      }));

      it('should not mark invalid when value equals max', fakeAsync(() => {
        testComponent.date = testComponent.datepicker._maxDate;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
          .not.toContain('ng-invalid');
      }));

      it('should not mark invalid when value is between min and max', fakeAsync(() => {
        testComponent.date = new Date(2010, JAN, 2);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
          .not.toContain('ng-invalid');
      }));
    });

    describe('datepicker with filter and validation', () => {
      let fixture: ComponentFixture<DatepickerWithFilterAndValidation>;
      let testComponent: DatepickerWithFilterAndValidation;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithFilterAndValidation, [NativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        fixture.detectChanges();
        flush();
      }));

      it('should mark input invalid', fakeAsync(() => {
        testComponent.date = new Date(2017, JAN, 1);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
          .toContain('ng-invalid');

        testComponent.date = new Date(2017, JAN, 2);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
          .not.toContain('ng-invalid');
      }));
    });

    describe('datepicker with change and input events', () => {
      let fixture: ComponentFixture<DatepickerWithChangeAndInputEvents>;
      let testComponent: DatepickerWithChangeAndInputEvents;
      let inputEl: HTMLInputElement;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithChangeAndInputEvents, [NativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        spyOn(testComponent, 'onChange');
        spyOn(testComponent, 'onInput');
        spyOn(testComponent, 'onDateChange');
        spyOn(testComponent, 'onDateInput');
      }));

      afterEach(fakeAsync(() => {
        fixture.detectChanges();
      }));

      it('should fire input and dateInput events when user types input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).toHaveBeenCalled();
        expect(testComponent.onDateInput).toHaveBeenCalled();
      });

      it('should fire change and dateChange events when user commits typed input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        dispatchFakeEvent(inputEl, 'change');
        fixture.detectChanges();

        expect(testComponent.onChange).toHaveBeenCalled();
        expect(testComponent.onDateChange).toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();
      });

      it('should not fire the dateInput event if the value has not changed', () => {
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = '12/12/2012';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);

        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);
      });
    });

    describe('with ISO 8601 strings as input', () => {
      let fixture: ComponentFixture<DatepickerWithISOStrings>;
      let testComponent: DatepickerWithISOStrings;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithISOStrings, [NativeDateModule]);
        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        fixture.detectChanges();
      }));

      it('should coerce ISO strings', fakeAsync(() => {
        expect(() => fixture.detectChanges()).not.toThrow();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepicker.startAt).toEqual(new Date(2017, JUL, 1));
        expect(testComponent.datepickerInput.value).toEqual(new Date(2017, JUN, 1));
        expect(testComponent.datepickerInput.min).toEqual(new Date(2017, JAN, 1));
        expect(testComponent.datepickerInput.max).toEqual(new Date(2017, DEC, 31));
      }));
    });
  });

  describe('with missing DateAdapter', () => {
    it('should throw when created', () => {
      expect(() => createComponent(StandardDatepicker))
        .toThrowError(/CdkDatepicker: No provider found for .*/);
    });
  });
});


@Component({
  template: `
    <input [cdkDatepicker]="d" [value]="date">
    <cdk-datepicker #d></cdk-datepicker>
  `,
})
class StandardDatepicker {
  date: Date | null = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: CdkDatepicker<Date>;
  @ViewChild(CdkDatepickerInput) datepickerInput: CdkDatepickerInput<Date>;
}


@Component({
  template: `
    <input [cdkDatepicker]="d"><input [cdkDatepicker]="d"><cdk-datepicker #d></cdk-datepicker>
  `,
})
class MultiInputDatepicker {}


@Component({
  template: `
    <input [cdkDatepicker]="d" [value]="date">
    <cdk-datepicker #d [startAt]="startDate"></cdk-datepicker>
  `,
})
class DatepickerWithStartAt {
  date = new Date(2020, JAN, 1);
  startDate = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: CdkDatepicker<Date>;
}

@Component({
  template: `
    <input [(ngModel)]="selected" [cdkDatepicker]="d">
    <cdk-datepicker #d></cdk-datepicker>
  `,
})
class DatepickerWithNgModel {
  selected: Date | null = null;
  @ViewChild('d') datepicker: CdkDatepicker<Date>;
  @ViewChild(CdkDatepickerInput) datepickerInput: CdkDatepickerInput<Date>;
}


@Component({
  template: `
    <input [formControl]="formControl" [cdkDatepicker]="d">
    <cdk-datepicker #d></cdk-datepicker>
  `,
})
class DatepickerWithFormControl {
  formControl = new FormControl();
  @ViewChild('d') datepicker: CdkDatepicker<Date>;
  @ViewChild(CdkDatepickerInput) datepickerInput: CdkDatepickerInput<Date>;
}


@Component({
  template: `
    <input [cdkDatepicker]="d" [(ngModel)]="date" [min]="minDate" [max]="maxDate">
    <cdk-datepicker #d></cdk-datepicker>
  `,
})
class DatepickerWithMinAndMaxValidation {
  @ViewChild('d') datepicker: CdkDatepicker<Date>;
  date: Date | null;
  minDate = new Date(2010, JAN, 1);
  maxDate = new Date(2020, JAN, 1);
}


@Component({
  template: `
    <input [cdkDatepicker]="d" [(ngModel)]="date" [cdkDatepickerFilter]="filter">
    <cdk-datepicker #d></cdk-datepicker>
  `,
})
class DatepickerWithFilterAndValidation {
  @ViewChild('d') datepicker: CdkDatepicker<Date>;
  date: Date;
  filter = (date: Date) => date.getDate() != 1;
}


@Component({
  template: `
    <input [cdkDatepicker]="d" (change)="onChange()" (input)="onInput()"
           (dateChange)="onDateChange()" (dateInput)="onDateInput()">
    <cdk-datepicker #d></cdk-datepicker>
  `
})
class DatepickerWithChangeAndInputEvents {
  @ViewChild('d') datepicker: CdkDatepicker<Date>;

  onChange() {}

  onInput() {}

  onDateChange() {}

  onDateInput() {}
}


@Component({
  template: `
    <input [cdkDatepicker]="d" [(ngModel)]="value" [min]="min" [max]="max">
    <cdk-datepicker #d [startAt]="startAt"></cdk-datepicker>
  `
})
class DatepickerWithISOStrings {
  value = new Date(2017, JUN, 1).toISOString();
  min = new Date(2017, JAN, 1).toISOString();
  max = new Date (2017, DEC, 31).toISOString();
  startAt = new Date(2017, JUL, 1).toISOString();
  @ViewChild('d') datepicker: CdkDatepicker<Date>;
  @ViewChild(CdkDatepickerInput) datepickerInput: CdkDatepickerInput<Date>;
}


@Component({
  template: `
    <input [(ngModel)]="selected" [cdkDatepicker]="d">
    <cdk-datepicker (opened)="openedSpy()" (closed)="closedSpy()" #d></cdk-datepicker>
  `,
})
class DatepickerWithEvents {
  selected: Date | null = null;
  openedSpy = jasmine.createSpy('opened spy');
  closedSpy = jasmine.createSpy('closed spy');
  @ViewChild('d') datepicker: CdkDatepicker<Date>;
}
