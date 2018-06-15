/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    ChangeDetectorRef,
    EventEmitter,
    Inject,
    Input,
    Optional,
    Output,
} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {Subject, Subscription} from 'rxjs';
import {createMissingDateImplError} from './datepicker-errors';

/**
 * Possible views for the calendar.
 * @docs-private
 */
export type CdkCalendarView = 'month' | 'year' | 'multi-year';

/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
export abstract class CalendarView<D> {

    /** A date representing when to start the calendar. */
    abstract set activeDate(value: D);

    /** The minimum selectable date. */
    abstract set minDate(value: D | null);

    /** The maximum selectable date. */
    abstract set maxDate(value: D | null);

    /** The currently selected date. */
    abstract set selected(value: D | null);

    @Input() _currentView: CdkCalendarView;



    // Don't know about these...
    private _intlChanges: Subscription;

    /** A function used to filter which dates are selectable. */
    @Input() dateFilter: (date: D) => boolean;

    /** Emits when the currently selected date changes. */
    @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits the year chosen in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits the month chosen in year view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits whenever there is a state change that the header may need to respond to.
     */
    stateChanges = new Subject<void>();

    constructor(
                @Optional() private _dateAdapter: DateAdapter<D>,
                @Optional() @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
                changeDetectorRef: ChangeDetectorRef) {

        if (!this._dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        if (!this._dateFormats) {
            throw createMissingDateImplError('MAT_DATE_FORMATS');
        }

        this._intlChanges = _intl.changes.subscribe(() => {
            changeDetectorRef.markForCheck();
            this.stateChanges.next();
        });
    }

    /** Handles year selection in the multiyear view. */
    _yearSelectedInMultiYearView(normalizedYear: D) {
        this.yearSelected.emit(normalizedYear);
    }

    /** Handles month selection in the year view. */
    _monthSelectedInYearView(normalizedMonth: D) {
        this.monthSelected.emit(normalizedMonth);
    }
}
