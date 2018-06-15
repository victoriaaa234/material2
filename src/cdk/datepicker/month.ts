// /**
//  * @license
//  * Copyright Google LLC All Rights Reserved.
//  *
//  * Use of this source code is governed by an MIT-style license that can be
//  * found in the LICENSE file at https://angular.io/license
//  */
//
// import {
//     AfterContentInit,
//     ChangeDetectionStrategy,
//     ChangeDetectorRef,
//     Component,
//     EventEmitter,
//     Inject,
//     Input,
//     Optional,
//     Output,
//     ViewEncapsulation,
//     ViewChild,
// } from '@angular/core';
// import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
// import {Directionality} from '@angular/cdk/bidi';
// import {MatCalendarBody, MatCalendarCell} from './calendar-body';
// import {createMissingDateImplError} from './datepicker-errors';
// import {CalendarView} from './calendar-view';
//
//
// const DAYS_PER_WEEK = 7;
//
//
// /**
//  * An internal component used to display a single month in the datepicker.
//  * @docs-private
//  */
// @Component({
//     moduleId: module.id,
//     selector: 'cdk-month',
//     templateUrl: 'cdk-month.html',
//     exportAs: 'cdkMonth',
//     encapsulation: ViewEncapsulation.None,
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class CdkMonth<D> extends CalendarView<D> implements AfterContentInit {
//     /**
//      * The date to display in this month view (everything other than the month and year is ignored).
//      */
//     @Input()
//     get activeDate(): D { return this._activeDate; }
//     set activeDate(value: D) {
//         const oldActiveDate = this._activeDate;
//         const validDate =
//             this._getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
//         this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
//         if (!this._hasSameMonthAndYear(oldActiveDate, this._activeDate)) {
//             this._init();
//         }
//     }
//     private _activeDate: D;
//
//     /** The currently selected date. */
//     @Input()
//     get selected(): D | null { return this._selected; }
//     set selected(value: D | null) {
//         this._selected = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
//         this._selectedDate = this._getDateInCurrentMonth(this._selected);
//     }
//     private _selected: D | null;
//
//     /** The minimum selectable date. */
//     @Input()
//     get minDate(): D | null { return this._minDate; }
//     set minDate(value: D | null) {
//         this._minDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
//     }
//     private _minDate: D | null;
//
//     /** The maximum selectable date. */
//     @Input()
//     get maxDate(): D | null { return this._maxDate; }
//     set maxDate(value: D | null) {
//         this._maxDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
//     }
//     private _maxDate: D | null;
//
//     /** A function used to filter which dates are selectable. */
//     @Input() dateFilter: (date: D) => boolean;
//
//     /** Emits when a new date is selected. */
//     @Output() readonly selectedChange: EventEmitter<D | null> = new EventEmitter<D | null>();
//
//     /** Emits when any date is selected. */
//     @Output() readonly _userSelection: EventEmitter<void> = new EventEmitter<void>();
//
//     /** Emits when any date is activated. */
//     @Output() readonly activeDateChange: EventEmitter<D> = new EventEmitter<D>();
//
//     /** The label for this month (e.g. "January 2017"). */
//     _monthLabel: string;
//
//     /**
//      * The date of the month that the currently selected Date falls on.
//      * Null if the currently selected Date is in another month.
//      */
//     _selectedDate: number | null;
//
//     /** The date of the month that today falls on. Null if today is in another month. */
//     _todayDate: number | null;
//
//     /** The names of the weekdays. */
//     _weekdays: {long: string, narrow: string}[];
//
//     constructor(private _changeDetectorRef: ChangeDetectorRef,
//                 @Optional() @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
//                 @Optional() public _dateAdapter: DateAdapter<D>,
//                 @Optional() private _dir?: Directionality) {
//         if (!this._dateAdapter) {
//             throw createMissingDateImplError('DateAdapter');
//         }
//         if (!this._dateFormats) {
//             throw createMissingDateImplError('MAT_DATE_FORMATS');
//         }
//
//         const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
//         const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
//         const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');
//
//         // Rotate the labels for days of the week based on the configured first day of the week.
//         let weekdays = longWeekdays.map((long, i) => {
//             return {long, narrow: narrowWeekdays[i]};
//         });
//         this._weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
//
//         this._activeDate = this._dateAdapter.today();
//     }
//
//     ngAfterContentInit() {
//         this._init();
//     }
//
//     /** Handles when a new date is selected. */
//     _dateSelected(date: number) {
//         if (this._selectedDate != date) {
//             const selectedYear = this._dateAdapter.getYear(this.activeDate);
//             const selectedMonth = this._dateAdapter.getMonth(this.activeDate);
//             const selectedDate = this._dateAdapter.createDate(selectedYear, selectedMonth, date);
//
//             this.selectedChange.emit(selectedDate);
//         }
//
//         this._userSelection.emit();
//     }
//
//     /** Initializes this month view. */
//     _init() {
//         this._selectedDate = this._getDateInCurrentMonth(this.selected);
//         this._todayDate = this._getDateInCurrentMonth(this._dateAdapter.today());
//         this._monthLabel =
//             this._dateAdapter.getMonthNames('short')[this._dateAdapter.getMonth(this.activeDate)]
//                 .toLocaleUpperCase();
//
//         let firstOfMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),
//             this._dateAdapter.getMonth(this.activeDate), 1);
//         this._firstWeekOffset =
//             (DAYS_PER_WEEK + this._dateAdapter.getDayOfWeek(firstOfMonth) -
//                 this._dateAdapter.getFirstDayOfWeek()) % DAYS_PER_WEEK;
//
//         this._changeDetectorRef.markForCheck();
//     }
//
//     /**
//      * Gets the date in this month that the given Date falls on.
//      * Returns null if the given Date is in another month.
//      */
//     private _getDateInCurrentMonth(date: D | null): number | null {
//         return date && this._hasSameMonthAndYear(date, this.activeDate) ?
//             this._dateAdapter.getDate(date) : null;
//     }
//
//     /** Checks whether the 2 dates are non-null and fall within the same month of the same year. */
//     private _hasSameMonthAndYear(d1: D | null, d2: D | null): boolean {
//         return !!(d1 && d2 && this._dateAdapter.getMonth(d1) == this._dateAdapter.getMonth(d2) &&
//             this._dateAdapter.getYear(d1) == this._dateAdapter.getYear(d2));
//     }
//
//     /**
//      * @param obj The object to check.
//      * @returns The given object if it is both a date instance and valid, otherwise null.
//      */
//     private _getValidDateOrNull(obj: any): D | null {
//         return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
//     }
// }
