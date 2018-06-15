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
//     ViewChild,
//     ViewEncapsulation,
// } from '@angular/core';
// import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
// import {Directionality} from '@angular/cdk/bidi';
// import {MatCalendarBody, MatCalendarCell} from './calendar-body';
// import {createMissingDateImplError} from './datepicker-errors';
// import {CalendarView} from './calendar-view';
//
// /**
//  * An internal component used to display a single year in the datepicker.
//  * @docs-private
//  */
// @Component({
//     moduleId: module.id,
//     selector: 'cdk-year',
//     templateUrl: 'year.html',
//     exportAs: 'cdkYear',
//     encapsulation: ViewEncapsulation.None,
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class CdkYear<D> extends CalendarView<D> implements AfterContentInit {
//     /** The date to display in this year view (everything other than the year is ignored). */
//     @Input()
//     get activeDate(): D { return this._activeDate; }
//     set activeDate(value: D) {
//         let oldActiveDate = this._activeDate;
//         const validDate =
//             this._getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
//         this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
//         if (this._dateAdapter.getYear(oldActiveDate) !== this._dateAdapter.getYear(this._activeDate)) {
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
//         this._selectedMonth = this._getMonthInCurrentYear(this._selected);
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
//     /** Emits when a new month is selected. */
//     @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();
//
//     /** Emits the selected month. This doesn't imply a change on the selected date */
//     @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();
//
//     /** Emits when any date is activated. */
//     @Output() readonly activeDateChange: EventEmitter<D> = new EventEmitter<D>();
//
//     /** The body of calendar table */
//     @ViewChild(MatCalendarBody) _matCalendarBody: MatCalendarBody;
//
//     /** The label for this year (e.g. "2017"). */
//     _yearLabel: string;
//
//     /** The month in this year that today falls on. Null if today is in a different year. */
//     _todayMonth: number | null;
//
//     /**
//      * The month in this year that the selected Date falls on.
//      * Null if the selected Date is in a different year.
//      */
//     _selectedMonth: number | null;
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
//         this._activeDate = this._dateAdapter.today();
//     }
//
//     ngAfterContentInit() {
//         this._init();
//     }
//
//     /** Initializes this year view. */
//     _init() {
//         this._selectedMonth = this._getMonthInCurrentYear(this.selected);
//         this._todayMonth = this._getMonthInCurrentYear(this._dateAdapter.today());
//         this._yearLabel = this._dateAdapter.getYearName(this.activeDate);
//
//         this._changeDetectorRef.markForCheck();
//     }
//
//     /**
//      * Gets the month in this year that the given Date falls on.
//      * Returns null if the given Date is in another year.
//      */
//     private _getMonthInCurrentYear(date: D | null) {
//         return date && this._dateAdapter.getYear(date) == this._dateAdapter.getYear(this.activeDate) ?
//             this._dateAdapter.getMonth(date) : null;
//     }
//
//     /**
//      * Tests whether the combination month/year is after this.maxDate, considering
//      * just the month and year of this.maxDate
//      */
//     private _isYearAndMonthAfterMaxDate(year: number, month: number) {
//         if (this.maxDate) {
//             const maxYear = this._dateAdapter.getYear(this.maxDate);
//             const maxMonth = this._dateAdapter.getMonth(this.maxDate);
//
//             return year > maxYear || (year === maxYear && month > maxMonth);
//         }
//
//         return false;
//     }
//
//     /**
//      * Tests whether the combination month/year is before this.minDate, considering
//      * just the month and year of this.minDate
//      */
//     private _isYearAndMonthBeforeMinDate(year: number, month: number) {
//         if (this.minDate) {
//             const minYear = this._dateAdapter.getYear(this.minDate);
//             const minMonth = this._dateAdapter.getMonth(this.minDate);
//
//             return year < minYear || (year === minYear && month < minMonth);
//         }
//
//         return false;
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
