
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
    Inject,
    Optional,
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
    Validators
} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {MatFormField} from '@angular/material/form-field';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {Subscription} from 'rxjs';
import {CdkDatepicker} from './datepicker';
import {createMissingDateImplError} from './datepicker-errors';


export const CDK_DATEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CdkDatepickerInput),
    multi: true
};


export const CDK_DATEPICKER_VALIDATORS: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CdkDatepickerInput),
    multi: true
};


/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use MatDatepickerInputEvent instead.
 */
export class CdkDatepickerInputEvent<D> {
    /** The new value for the target datepicker input. */
    value: D | null;

    constructor(
        /** Reference to the datepicker input component that emitted the event. */
        public target: CdkDatepickerInput<D>,
        /** Reference to the native input element associated with the datepicker input. */
        public targetElement: HTMLElement) {
        this.value = this.target.value;
    }
}


/** Directive used to connect an input to a CdkDatepicker. */
@Directive({
    selector: 'input[cdkDatepicker]',
    providers: [
        CDK_DATEPICKER_VALUE_ACCESSOR,
        CDK_DATEPICKER_VALIDATORS,
        {useExisting: CdkDatepickerInput},
    ],
    host: {
        '[attr.aria-haspopup]': 'true',
        '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
        '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
        '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
        '[disabled]': 'disabled',
        '(input)': '_onInput($event.target.value)',
        '(change)': '_onChange()',
    },
    exportAs: 'cdkDatepickerInput',
})
export class CdkDatepickerInput<D> implements AfterContentInit, ControlValueAccessor, OnDestroy,
    Validator {
    /** The datepicker that this input is associated with. */
    @Input()
    set cdkDatepicker(value: CdkDatepicker<D>) {
        this.registerDatepicker(value);
    }
    _datepicker: CdkDatepicker<D>;

    private registerDatepicker(value: CdkDatepicker<D>) {
        if (value) {
            this._datepicker = value;
            this._datepicker._registerInput(this);
        }
    }

    /** The value of the input. */
    @Input()
    get value(): D | null { return this._value; }
    set value(value: D | null) {
        value = this._dateAdapter.deserialize(value);
        this._lastValueValid = !value || this._dateAdapter.isValid(value);
        value = this._getValidDateOrNull(value);
        const oldDate = this.value;
        this._value = value;
        this._formatValue(value);

        if (!this._dateAdapter.sameDate(oldDate, value)) {
            this._valueChange.emit(value);
        }
    }
    private _value: D | null;

    /** The minimum valid date. */
    @Input()
    get min(): D | null { return this._min; }
    set min(value: D | null) {
        this._min = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
        this._validatorOnChange();
    }
    private _min: D | null;

    /** The maximum valid date. */
    @Input()
    get max(): D | null { return this._max; }
    set max(value: D | null) {
        this._max = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
        this._validatorOnChange();
    }
    private _max: D | null;

    /** Whether the datepicker-input is disabled. */
    @Input()
    get disabled(): boolean { return !!this._disabled; }
    set disabled(value: boolean) {
        const newValue = coerceBooleanProperty(value);

        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this._disabledChange.emit(newValue);
        }

    }
    private _disabled: boolean;

    /** Emits when a `change` event is fired on this `<input>`. */
    @Output() readonly dateChange: EventEmitter<CdkDatepickerInputEvent<D>> =
        new EventEmitter<CdkDatepickerInputEvent<D>>();

    /** Emits when an `input` event is fired on this `<input>`. */
    @Output() readonly dateInput: EventEmitter<CdkDatepickerInputEvent<D>> =
        new EventEmitter<CdkDatepickerInputEvent<D>>();

    /** Emits when the value changes (either due to user input or programmatic change). */
    _valueChange = new EventEmitter<D | null>();

    /** Emits when the disabled state has changed */
    _disabledChange = new EventEmitter<boolean>();

    private _validatorOnChange = () => {};

    private _datepickerSubscription = Subscription.EMPTY;

    private _localeSubscription = Subscription.EMPTY;

    /** The form control validator for whether the input parses. */
    private _parseValidator: ValidatorFn = (): ValidationErrors | null => {
        return this._lastValueValid ?
            null : {'cdkDatepickerParse': {'text': this._elementRef.nativeElement.value}};
    }

    /** The form control validator for the min date. */
    private _minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
        return (!this.min || !controlValue ||
            this._dateAdapter.compareDate(this.min, controlValue) <= 0) ?
            null : {'cdkDatepickerMin': {'min': this.min, 'actual': controlValue}};
    }

    /** The form control validator for the max date. */
    private _maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
        return (!this.max || !controlValue ||
            this._dateAdapter.compareDate(this.max, controlValue) >= 0) ?
            null : {'cdkDatepickerMax': {'max': this.max, 'actual': controlValue}};
    }

    /** The combined form control validator for this input. */
    private _validator: ValidatorFn | null =
        Validators.compose(
            [this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator]);

    /** Whether the last value set on the input was valid. */
    private _lastValueValid = false;

    constructor(
        private _elementRef: ElementRef,
        @Optional() public _dateAdapter: DateAdapter<D>,
        @Optional() @Inject(CDK_DATE_FORMATS) private _dateFormats: CdkDateFormats,
        @Optional() private _formField: CdkFormField) {
        if (!this._dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }
        if (!this._dateFormats) {
            throw createMissingDateImplError('CDK_DATE_FORMATS');
        }

        // Update the displayed date when the locale changes.
        this._localeSubscription = _dateAdapter.localeChanges.subscribe(() => {
            this.value = this.value;
        });
    }

    ngAfterContentInit() {
        if (this._datepicker) {
            this._datepickerSubscription = this._datepicker._selectedChanged.subscribe((selected: D) => {
                this.value = selected;
                this.dateInput.emit(new CdkDatepickerInputEvent(this, this._elementRef.nativeElement));
                this.dateChange.emit(new CdkDatepickerInputEvent(this, this._elementRef.nativeElement));
            });
        }
    }

    ngOnDestroy() {
        this._datepickerSubscription.unsubscribe();
        this._localeSubscription.unsubscribe();
        this._valueChange.complete();
        this._disabledChange.complete();
    }

    /** @docs-private */
    registerOnValidatorChange(fn: () => void): void {
        this._validatorOnChange = fn;
    }

    /** @docs-private */
    validate(c: AbstractControl): ValidationErrors | null {
        return this._validator ? this._validator(c) : null;
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: D): void {
        this.value = value;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    _onInput(value: string) {
        let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
        this._lastValueValid = !date || this._dateAdapter.isValid(date);
        date = this._getValidDateOrNull(date);

        if (!this._dateAdapter.sameDate(date, this._value)) {
            this._value = date;
            this._valueChange.emit(date);
            this.dateInput.emit(new CdkDatepickerInputEvent(this, this._elementRef.nativeElement));
        }
    }

    _onChange() {
        this.dateChange.emit(new CdkDatepickerInputEvent(this, this._elementRef.nativeElement));
    }

    /** Formats a value and sets it on the input element. */
    private _formatValue(value: D | null) {
        this._elementRef.nativeElement.value =
            value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    private _getValidDateOrNull(obj: any): D | null {
        return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
    }
}

