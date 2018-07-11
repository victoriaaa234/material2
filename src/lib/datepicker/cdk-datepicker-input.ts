/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
    AfterContentInit,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    Output,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
    ValidatorFn,
    Validators,
} from '@angular/forms';
// import {CdkDatepicker} from './cdk-datepicker';
import {DateAdapter} from '@angular/cdk/datetime';
import {Subscription} from 'rxjs';
import {MatDatepickerInput} from "@angular/material/datepicker/datepicker-input";
import {CdkDatepicker} from "@angular/material/datepicker/cdk-datepicker";


/**
 * Provider that allows the datepicker to register as a ControlValueAccessor.
 */
export const DATEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CdkDatepickerInput),
    multi: true
};


/**
 * Provider that allows the datepicker to register as a ControlValueAccessor.
 */
export const DATEPICKER_VALIDATORS: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CdkDatepickerInput),
    multi: true
};
//
// /**
//  * An event used for datepicker input and change events. For consistency, we always use DatepickerInputEvent instead.
//  */
// export class DatepickerInputEvent<D> {
//     /** The new value for the target datepicker input. */
//     value: D | null;
//
//     constructor(
//         /** Reference to the datepicker input component that emitted the event. */
//         public target: CdkDatepickerInput<D>,
//         /** Reference to the native input element associated with the datepicker input. */
//         public targetElement: HTMLElement) {
//         this.value = this.target.value;
//     }
// }

//
//
// /**
//  * An event used for datepicker input and change events. For consistency, we always use
//  * CdkDatepickerInputEvent instead.
//  */
// export interface CdkDatepickerInputEvent<D> {
//     /** The new value for the target datepicker input. */
//     value: string;
//
//     /** The native `<input>` element that the event is being fired for. */
//     input: HTMLInputElement;
// }
//
//
/** Directive used to connect an input to a CdkDatepicker. */
@Directive({
    selector: 'input[cdkDatepicker]',
    providers: [
        DATEPICKER_VALUE_ACCESSOR,
        DATEPICKER_VALIDATORS,
    ],
//     host: {
//         '[attr.aria-owns]': (_cdkDatepicker.id) || null',
//         '[attr.min]': min ? dateAdapter.toIso8601(min) : null',
//         '[attr.max]': max ? dateAdapter.toIso8601(max) : null',
//         '[disabled]': disabled',
//         '(input)': emitDateInput()',
//         '(change)': emitDateChange()',
//         '(blur)': onBlur()',
//     },
    exportAs: 'cdkDatepickerInput',
})
export class CdkDatepickerInput<D> {
    // /** The datepicker that this input is associated with. */
    // @Input('cdkDatepicker')
    // get datepicker(): CdkDatepicker<D> {
    //     return this._cdkDatepicker;
    // }
    //
    // set datepicker(value: CdkDatepicker<D>) {
    //     this._registerDatepicker(value);
    // }
    //
    // private _cdkDatepicker: CdkDatepicker<D>;
    //
    // /** Register datepicker CDK to input. */
    // private _registerDatepicker(value: CdkDatepicker<D>) {
    //     if (value) {
    //         this._cdkDatepicker = value;
    //         this._cdkDatepicker._registerInput(this);
    //     }
    // }

    /** Function that can be used to filter out dates within the datepicker. */
    @Input('cdkDatepickerFilter')
    set filter(value: (date: D | null) => boolean) {
        this._dateFilter = value;
        this.validatorOnChange();
    }

    _dateFilter: (date: D | null) => boolean;

    /** The value of the input. */
    @Input()
    get value(): D | null {
        return this._value;
    }

    set value(value: D | null) {
        value = this.dateAdapter.deserialize(value);
        this.lastValueValid = !value || this.dateAdapter.isValid(value);
        value = this.getValidDateOrNull(value);
        const oldDate = this._value;
        this._value = value;
        this.emitValue(oldDate, value);
    }

    protected _value: D | null;

    /** Emit value change if dates are different. */
    emitValue(oldDate: D | null, value: D | null) {
        if (!this.dateAdapter.sameDate(oldDate, value)) {
            this.valueChange.emit(value);
        }
    }

    /** The minimum valid date. */
    @Input()
    get min(): D | null {
        return this._min;
    }

    set min(value: D | null) {
        this._min = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    private _min: D | null;

    /** The maximum valid date. */
    @Input()
    get max(): D | null {
        return this._max;
    }

    set max(value: D | null) {
        this._max = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    private _max: D | null;

    /** Whether the datepicker-input is disabled. */
    @Input()
    get disabled(): boolean {
        return !!this._disabled;
    }

    set disabled(value: boolean) {
        const newValue = coerceBooleanProperty(value);
        const element = this._elementRef.nativeElement;

        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this.disabledChange.emit(newValue);
        }

        // We need to null check the `blur` method, because it's undefined during SSR.
        if (newValue && element.blur) {
            // Normally, native input elements automatically blur if they turn disabled. This behavior
            // is problematic, because it would mean that it triggers another change detection cycle,
            // which then causes a changed after checked error if the input element was focused before.
            element.blur();
        }
    }

    private _disabled: boolean;

    // /** Emits when a `change` event is fired on this `<input>`. */
    // @Output('cdkDatepickerChange')
    // readonly change: EventEmitter<CdkDatepickerInputEvent<D>> =
    //     new EventEmitter<CdkDatepickerInputEvent<D>>();
    //
    // /** Emits when an `input` event is fired on this `<input>`. */
    // @Output('cdkDatepickerInput')
    // readonly input: EventEmitter<CdkDatepickerInputEvent<D>> =
    //     new EventEmitter<CdkDatepickerInputEvent<D>>();

    /** Emits when the value changes (either due to user input or programmatic change). */
    valueChange = new EventEmitter<D | null>();

    /** Emits when the disabled state has changed. */
    disabledChange = new EventEmitter<boolean>();

    // /** Implemented as part of ControlValueAccessor. */
    // private _onTouched = () => {};

    /** Implemented as part of ControlValueAccessor. */
    protected controlValueAccessorOnChange: (value: any) => void = () => {};

    /** Implemented as part of ControlValueAccessor. */
    protected validatorOnChange = () => {};
//
//     /** Implemented for datepicker CDK subscription. */
//     private _cdkDatepickerSubscription = Subscription.EMPTY;
//
    /** Implemented for datepicker locale subscription. */
    private _localeSubscription = Subscription.EMPTY;
//
//     /** The native input element to which this directive is attached. */
//     protected inputElement: HTMLInputElement;
//
//     /** The form control validator for whether the input parses. */
//     private _parseCdkValidator: ValidatorFn = (): ValidationErrors | null => {
//         return this.lastValueValid ?
//             null : {'cdkDatepickerParse': {'text': this.inputElement.value}};
//     }
//
//     /** The form control validator for the min date. */
//     private _minCdkValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
//         const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));
//         return (!this.min || !controlValue ||
//             this.dateAdapter.compareDate(this.min, controlValue) <= 0) ?
//             null : {'cdkDatepickerMin': {'min': this.min, 'actual': controlValue}};
//     }
//
//     /** The form control validator for the max date. */
//     private _maxCdkValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
//         const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));
//         return (!this.max || !controlValue ||
//             this.dateAdapter.compareDate(this.max, controlValue) >= 0) ?
//             null : {'cdkDatepickerMax': {'max': this.max, 'actual': controlValue}};
//     }
//
//     /** The form control validator for the date filter. */
//     private _filterCdkValidator: ValidatorFn = (control: AbstractControl):
//         ValidationErrors | null => {
//         const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));
//         return !this.dateFilter || !controlValue || this.dateFilter(controlValue) ?
//             null : {'cdkDatepickerFilter': true};
//     }
//
//     /** The combined form control validator for this input. */
//     private _combinedValidator: ValidatorFn | null =
//         Validators.compose(
//             [this._parseCdkValidator, this._minCdkValidator, this._maxCdkValidator,
//                 this._filterCdkValidator]);
//
    /** Whether the last value set on the input was valid. */
    protected lastValueValid = false;
// //
//     protected elementRef: ElementRef;

    /** Constructor for the datepicker input component. */
    constructor(public dateAdapter: DateAdapter<D>, protected _elementRef: ElementRef) {
        if (!this.dateAdapter) {
            throw Error('CdkDatepicker: No provider found for DateAdapter.');
        }

        // this.inputElement = this.elementRef.nativeElement as HTMLInputElement;
        //
        // Update the displayed date when the locale changes.
        this._localeSubscription = this.dateAdapter.localeChanges.subscribe(() => {
            this._value = this._value;
        });
    }
//
//     /**
//      * Initializes datepicker with subscription and ControlValueAccessor
//      * implementations.
//      */
//     init() {
//         if (this._cdkDatepicker) {
//             this._cdkDatepickerSubscription = this._cdkDatepicker.selectedChanged.subscribe(
//                 (selected: D) => {
//                     this.emitChange(selected);
//                     this.emitDateInput();
//                     this.emitDateChange();
//                 }
//             );
//         }
//     }
//
//     /** Initializes datepicker with ControlValueAccessor implementations. */
//     emitChange(selected: D) {
//         this._value = selected;
//         this.controlValueAccessorOnChange(selected);
//         this._onTouched();
//     }
//
//     /** Content initialization. */
//     ngAfterContentInit() {
//         this.init();
//     }
//
//     /** Unsubscribes datepicker subscription. */
//     destroy() {
//         this._cdkDatepickerSubscription.unsubscribe();
//     }
//
//     /** Destroy events and subscriptions. */
//     ngOnDestroy() {
//         this.destroy();
//         this._localeSubscription.unsubscribe();
//         this.valueChange.complete();
//         this.disabledChange.complete();
//     }
//
//     /** @docs-private */
//     registerOnValidatorChange(fn: () => void): void {
//         this.validatorOnChange = fn;
//     }
//
//     /** @docs-private */
//     validate(c: AbstractControl): ValidationErrors | null {
//         return this._combinedValidator ? this._combinedValidator(c) : null;
//     }
//
//     // Implemented as part of ControlValueAccessor.
//     writeValue(value: D): void {
//         this._value = value;
//     }
//
    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this.controlValueAccessorOnChange = fn;
    }
//
//     // Implemented as part of ControlValueAccessor.
//     registerOnTouched(fn: () => void): void {
//         this._onTouched = fn;
//     }
//
    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
//
//     /** Emits new datepicker input event when the input event is emitted. */
//     emitDateInput() {
//         this.input.emit({ input: this.inputElement, value: this.inputElement.value});
//     }
//
//     /** Emits new datepicker change event when the change event is emitted. */
//     emitDateChange() {
//         this.change.emit( {input: this.inputElement, value: this.inputElement.value});
//     }
//
//     /** Handles blur events on the input. */
//     onBlur() {
//         this.formatIfValueExists();
//         this._onTouched();
//     }
//
//     /** Format value if it exists. */
//     formatIfValueExists() {}
//
    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    protected getValidDateOrNull(obj: any): D | null {
        return (this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj)) ? obj : null;
    }
}
