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
//     Input,
//     Optional,
//     Output,
//     ViewChild,
//     ViewEncapsulation,
// } from '@angular/core';
// import {DateAdapter} from '@angular/material/core';
// import {Directionality} from '@angular/cdk/bidi';
// import {MatCalendarBody, MatCalendarCell} from './calendar-body';
// import {createMissingDateImplError} from './datepicker-errors';
// import {CalendarView} from './calendar-view';
//
// export const yearsPerPage = 24;
//
// export const yearsPerRow = 4;
//
//
// /**
//  * An internal component used to display a year selector in the datepicker.
//  * @docs-private
//  */
// @Component({
//     moduleId: module.id,
//     selector: 'cdk-multi-year',
//     templateUrl: 'multi-year.html',
//     exportAs: 'cdkMultiYear',
//     encapsulation: ViewEncapsulation.None,
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class CdkMultiYear<D> extends CalendarView<D> implements AfterContentInit {
//     /** The date to display in this multi-year view (everything other than the year is ignored). */
//     @Input()
//     get activeDate(): D { return this._activeDate; }
//     set activeDate(value: D) {
//         let oldActiveDate = this._activeDate;
//         const validDate =
//             this._getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
//         this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
//         if (Math.floor(this._dateAdapter.getYear(oldActiveDate) / yearsPerPage) !=
//             Math.floor(this._dateAdapter.getYear(this._activeDate) / yearsPerPage)) {
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
//         this._selectedYear = this._selected && this._dateAdapter.getYear(this._selected);
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
//     /** Emits when a new year is selected. */
//     @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();
//
//     /** Emits the selected year. This doesn't imply a change on the selected date */
//     @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();
//
//     /** Emits when any date is activated. */
//     @Output() readonly activeDateChange: EventEmitter<D> = new EventEmitter<D>();
//
//     /** The body of calendar table */
//     @ViewChild(MatCalendarBody) _matCalendarBody: MatCalendarBody;
//
//     /** The year that today falls on. */
//     _todayYear: number;
//
//     /** The year of the selected date. Null if the selected date is null. */
//     _selectedYear: number | null;
//
//     constructor(private _changeDetectorRef: ChangeDetectorRef,
//                 @Optional() public _dateAdapter: DateAdapter<D>,
//                 @Optional() private _dir?: Directionality) {
//         if (!this._dateAdapter) {
//             throw createMissingDateImplError('DateAdapter');
//         }
//
//         this._activeDate = this._dateAdapter.today();
//     }
//
//     ngAfterContentInit() {
//         this._init();
//     }
//
//     /** Initializes this multi-year view. */
//     _init() {
//         this._todayYear = this._dateAdapter.getYear(this._dateAdapter.today());
//         let activeYear = this._dateAdapter.getYear(this._activeDate);
//         let activeOffset = activeYear % yearsPerPage;
//         this._years = [];
//         for (let i = 0, row: number[] = []; i < yearsPerPage; i++) {
//             row.push(activeYear - activeOffset + i);
//             if (row.length == yearsPerRow) {
//                 this._years.push(row.map(year => this._createCellForYear(year)));
//                 row = [];
//             }
//         }
//         this._changeDetectorRef.markForCheck();
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
