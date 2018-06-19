/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewChild,
    ViewEncapsulation,
    OnDestroy,
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {CdkDatepickerInput} from './datepicker-input';
import {DateAdapter} from '../../lib/core/datetime';
import {CalendarView} from './calendar-view';

/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;

/**
 * The CDK datepicker component that the user can
 */
// TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="cdkDatepicker"). We can change this to a directive
// if angular adds support for `exportAs: '$implicit'` on directives.
@Component({
    moduleId: module.id,
    selector: 'cdk-datepicker',
    template: '<ng-content></ng-content>',
    exportAs: 'cdkDatepicker',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class CdkDatepicker<D> implements OnDestroy {
    /** The date to initialize the calendar. */
    @Input()
    get startAt(): D | null {
        // If an explicit startAt is set we start there, otherwise we start at whatever the
        // currently selected value is.
        return this._startAt || (this._cdkDatepickerInput ? this._cdkDatepickerInput.value : null);
    }
    set startAt(value: D | null) {
        this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    private _startAt: D | null;

    /** The id for the datepicker calendar. */
    id: string = `cdk-datepicker-${datepickerUid++}`;

    /** The currently selected date. */
    get _selected(): D | null { return this._validSelected; }
    set _selected(value: D | null) { this._validSelected = value; }
    private _validSelected: D | null = null;

    /** The minimum selectable date. */
    get _minDate(): D | null {
        return this._cdkDatepickerInput && this._cdkDatepickerInput.min;
    }

    /** The maximum selectable date. */
    get _maxDate(): D | null {
        return this._cdkDatepickerInput && this._cdkDatepickerInput.max;
    }

    /** Subscription to value changes in the associated input element. */
    private _inputSubscription = Subscription.EMPTY;

    /** The input element this datepicker is associated with. */
    _cdkDatepickerInput: CdkDatepickerInput<D>;

    /** Emits new selected date when selected date changes. */
    readonly _selectedChanged = new Subject<D>();

    constructor(private _dateAdapter: DateAdapter<D>) {
        if (!this._dateAdapter) {
            throw Error(
                `No provider found for DateAdapter.`);
        }
    }

    @ViewChild(CalendarView) _calendar: CalendarView<D>;

    ngOnDestroy() {
        this._inputSubscription.unsubscribe();
    }

    /** Selects the given date */
    _select(date: D): void {
        let oldValue = this._selected;
        this._selected = date;
        if (!this._dateAdapter.sameDate(oldValue, this._selected)) {
            this._selectedChanged.next(date);
        }
    }

    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     */
    _registerCdkInput(input: CdkDatepickerInput<D>): void {
        if (this._cdkDatepickerInput) {
            throw Error('A CdkDatepicker can only be associated with a single input.');
        }
        this._cdkDatepickerInput = input;
        this._inputSubscription =
            this._cdkDatepickerInput._valueChange.subscribe((value: D | null) =>
                this._selected = value);
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    private _getValidDateOrNull(obj: any): D | null {
        return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj))
            ? obj : null;
    }
}
