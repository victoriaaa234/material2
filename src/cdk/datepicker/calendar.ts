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
//     OnChanges,
//     OnDestroy,
//     Optional,
//     Output,
//     SimpleChanges,
//     ViewChild,
//     ViewEncapsulation,
// } from '@angular/core';
// import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
// import {Subject, Subscription} from 'rxjs';
// import {createMissingDateImplError} from './datepicker-errors';
// import {CdkDatepickerIntl} from './datepicker-intl';
// import {CdkMonth} from './month';
// import {CdkMultiYear, yearsPerPage} from './multi-year';
// import {CdkYear} from './year';
//
// /**
//  * Possible views for the calendar.
//  * @docs-private
//  */
// import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
//
// export type CdkCalendarView = 'month' | 'year' | 'multi-year';
//
// /**
//  * A calendar that is used as part of the datepicker.
//  * @docs-private
//  */
// @Component({
//     moduleId: module.id,
//     selector: 'cdk-calendar',
//     templateUrl: '<ng-template><ng-content></ng-content></ng-template>',
//     host: {
//         'class': 'cdk-calendar',
//     },
//     exportAs: 'cdkCalendar',
//     encapsulation: ViewEncapsulation.None,
//     changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class CdkCalendar<D> implements AfterContentInit, OnDestroy, OnChanges {
//
//     private _intlChanges: Subscription;
//
//     /** A date representing the period (month or year) to start the calendar in. */
//     @Input()
//     get startAt(): D | null { return this._startAt; }
//     set startAt(value: D | null) {
//         this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
//     }
//     private _startAt: D | null;
//
//     /** Whether the calendar should be started in month or year view. */
//     @Input() startView: CdkCalendarView = 'month';
//
//     /** The currently selected date. */
//     @Input()
//     get selected(): D | null { return this._selected; }
//     set selected(value: D | null) {
//         this._selected = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
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
//     /** Emits when the currently selected date changes. */
//     @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();
//
//     /**
//      * Emits the year chosen in multiyear view.
//      * This doesn't imply a change on the selected date.
//      */
//     @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();
//
//     /**
//      * Emits the month chosen in year view.
//      * This doesn't imply a change on the selected date.
//      */
//     @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();
//
//     /** Emits when any date is selected. */
//     @Output() readonly _userSelection: EventEmitter<void> = new EventEmitter<void>();
//
//     /** Reference to the current month view component. */
//     @ViewChild(CdkMonth) month: CdkMonth<D>;
//
//     /** Reference to the current year view component. */
//     @ViewChild(CdkYear) year: CdkYear<D>;
//
//     /** Reference to the current multi-year view component. */
//     @ViewChild(CdkMultiYear) multiYear: CdkMultiYear<D>;
//
//     /**
//      * The current active date. This determines which time period is shown and which date is
//      * highlighted when using keyboard navigation.
//      */
//     get activeDate(): D { return this._clampedActiveDate; }
//     set activeDate(value: D) {
//         this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
//         this.stateChanges.next();
//     }
//     private _clampedActiveDate: D;
//
//     /** Whether the calendar is in month view. */
//     get currentView(): CdkCalendarView { return this._currentView; }
//     set currentView(value: CdkCalendarView) {
//         this._currentView = value;
//     }
//     private _currentView: CdkCalendarView;
//
//     /**
//      * Emits whenever there is a state change that the header may need to respond to.
//      */
//     stateChanges = new Subject<void>();
//
//     constructor(_intl: CdkDatepickerIntl,
//                 @Optional() private _dateAdapter: DateAdapter<D>,
//                 @Optional() @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
//                 changeDetectorRef: ChangeDetectorRef) {
//
//         if (!this._dateAdapter) {
//             throw createMissingDateImplError('DateAdapter');
//         }
//
//         if (!this._dateFormats) {
//             throw createMissingDateImplError('MAT_DATE_FORMATS');
//         }
//
//         this._intlChanges = _intl.changes.subscribe(() => {
//             changeDetectorRef.markForCheck();
//             this.stateChanges.next();
//         });
//     }
//
//     ngAfterContentInit() {
//         this.activeDate = this.startAt || this._dateAdapter.today();
//
//         // Assign to the private property since we don't want to move focus on init.
//         this._currentView = this.startView;
//     }
//
//     ngOnDestroy() {
//         this._intlChanges.unsubscribe();
//         this.stateChanges.complete();
//     }
//
//     ngOnChanges(changes: SimpleChanges) {
//         const change = changes.minDate || changes.maxDate || changes.dateFilter;
//
//         if (change && !change.firstChange) {
//             const view = this._getCurrentViewComponent();
//
//             if (view) {
//                 view._init();
//             }
//         }
//
//         this.stateChanges.next();
//     }
//
//     /** Handles date selection in the month view. */
//     _dateSelected(date: D): void {
//         if (!this._dateAdapter.sameDate(date, this.selected)) {
//             this.selectedChange.emit(date);
//         }
//     }
//
//     /** Handles year selection in the multiyear view. */
//     _yearSelectedInMultiYearView(normalizedYear: D) {
//         this.yearSelected.emit(normalizedYear);
//     }
//
//     /** Handles month selection in the year view. */
//     _monthSelectedInYearView(normalizedMonth: D) {
//         this.monthSelected.emit(normalizedMonth);
//     }
//
//     _userSelected(): void {
//         this._userSelection.emit();
//     }
//
//     /** Handles year/month selection in the multi-year/year views. */
//     _goToDateInView(date: D, view: 'month' | 'year' | 'multi-year'): void {
//         this.activeDate = date;
//         this.currentView = view;
//     }
//
//     /**
//      * @param obj The object to check.
//      * @returns The given object if it is both a date instance and valid, otherwise null.
//      */
//     private _getValidDateOrNull(obj: any): D | null {
//         return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
//     }
//
//     /** Returns the component instance that corresponds to the current calendar view. */
//     private _getCurrentViewComponent() {
//         return this.month || this.year || this.multiYear;
//     }
// }
