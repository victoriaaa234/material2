// /**
//  * @license
//  * Copyright Google LLC All Rights Reserved.
//  *
//  * Use of this source code is governed by an MIT-style license that can be
//  * found in the LICENSE file at https://angular.io/license
//  */
//
// import {Directionality} from '@angular/cdk/bidi';
// import {coerceBooleanProperty} from '@angular/cdk/coercion';
// import {ESCAPE, UP_ARROW} from '@angular/cdk/keycodes';
// import {
//     Overlay,
//     OverlayConfig,
//     OverlayRef,
//     PositionStrategy,
//     ScrollStrategy,
// } from '@angular/cdk/overlay';
// import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
// import {DOCUMENT} from '@angular/common';
// import {take, filter} from 'rxjs/operators';
// import {
//     AfterViewInit,
//     ChangeDetectionStrategy,
//     Component,
//     ComponentRef,
//     ElementRef,
//     EventEmitter,
//     Inject,
//     InjectionToken,
//     Input,
//     NgZone,
//     Optional,
//     Output,
//     ViewChild,
//     ViewContainerRef,
//     ViewEncapsulation,
//     OnDestroy,
// } from '@angular/core';
// import {merge, Subject, Subscription} from 'rxjs';
// import {createMissingDateImplError} from './datepicker-errors';
// import {CdkDatepickerInput} from './datepicker-input';
// import {CdkCalendar} from './calendar';
// import {DateAdapter} from '../../lib/core/datetime';
// import {CalendarView} from '@angular/cdk/datepicker/calendar-view';
//
// /** Used to generate a unique ID for each datepicker instance. */
// let datepickerUid = 0;
//
// /** Injection token that determines the scroll handling while the calendar is open. */
// export const MAT_DATEPICKER_SCROLL_STRATEGY =
//     new InjectionToken<() => ScrollStrategy>('mat-datepicker-scroll-strategy');
//
// /** @docs-private */
// export function MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
//     return () => overlay.scrollStrategies.reposition();
// }
//
// /** @docs-private */
// export const MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
//     provide: MAT_DATEPICKER_SCROLL_STRATEGY,
//     deps: [Overlay],
//     useFactory: MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY,
// };
//
// // Boilerplate for applying mixins to MatDatepickerContent.
// /** @docs-private */
// export class MatDatepickerContentBase {
//     constructor(public _elementRef: ElementRef) { }
// }
//
// /**
//  * Component used as the content for the datepicker dialog and popup. We use this instead of using
//  * MatCalendar directly as the content so we can control the initial focus. This also gives us a
//  * place to put additional features of the popup that are not part of the calendar itself in the
//  * future. (e.g. confirmation buttons).
//  * @docs-private
//  */
// @Component({
//     moduleId: module.id,
//     selector: 'mat-datepicker-content',
//     templateUrl: 'datepicker-content.html',
//     styleUrls: ['datepicker-content.css'],
//     host: {
//         'class': 'mat-datepicker-content',
//         '[@transformPanel]': '"enter"',
//         '[class.mat-datepicker-content-touch]': 'datepicker.touchUi',
//     },
//     exportAs: 'matDatepickerContent',
//     encapsulation: ViewEncapsulation.None,
//     changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class CdkDatepickerContent<D> {
//
//     /** Reference to the internal calendar component. */
//     @ViewChild(CalendarView) _calendar: CalendarView<D>;
//
//     /** Reference to the datepicker that created the overlay. */
//     datepicker: CdkDatepicker<D>;
// }
//
//
// // TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// // template reference variables (e.g. #d vs #d="cdkDatepicker"). We can change this to a directive
// // if angular adds support for `exportAs: '$implicit'` on directives.
// /** Component responsible for managing the datepicker popup/dialog. */
// @Component({
//     moduleId: module.id,
//     selector: 'cdk-datepicker',
//     template: '',
//     exportAs: 'cdkDatepicker',
//     changeDetection: ChangeDetectionStrategy.OnPush,
//     encapsulation: ViewEncapsulation.None,
// })
// export class CdkDatepicker<D> implements OnDestroy {
//     /** The date to open the calendar to initially. */
//     @Input()
//     get startAt(): D | null {
//         // If an explicit startAt is set we start there, otherwise we start at whatever the currently
//         // selected value is.
//         return this._startAt || (this._datepickerInput ? this._datepickerInput.value : null);
//     }
//     set startAt(value: D | null) {
//         this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
//     }
//     private _startAt: D | null;
//
//     /** The view that the calendar should start in. */
//     @Input() startView: 'month' | 'year' = 'month';
//
//     /**
//      * Emits selected year in multiyear view.
//      * This doesn't imply a change on the selected date.
//      */
//     @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();
//
//     /**
//      * Emits selected month in year view.
//      * This doesn't imply a change on the selected date.
//      */
//     @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();
//
//     /** Classes to be passed to the date picker panel. Supports the same syntax as `ngClass`. */
//     @Input() panelClass: string | string[];
//
//     /** The id for the datepicker calendar. */
//     id: string = `mat-datepicker-${datepickerUid++}`;
//
//     /** The currently selected date. */
//     get _selected(): D | null { return this._validSelected; }
//     set _selected(value: D | null) { this._validSelected = value; }
//     private _validSelected: D | null = null;
//
//     /** The minimum selectable date. */
//     get _minDate(): D | null {
//         return this._datepickerInput && this._datepickerInput.min;
//     }
//
//     /** The maximum selectable date. */
//     get _maxDate(): D | null {
//         return this._datepickerInput && this._datepickerInput.max;
//     }
//
//     get _dateFilter(): (date: D | null) => boolean {
//         return this._datepickerInput && this._datepickerInput._dateFilter;
//     }
//
//     /** Subscription to value changes in the associated input element. */
//     private _inputSubscription = Subscription.EMPTY;
//
//     /** The input element this datepicker is associated with. */
//     _datepickerInput: CdkDatepickerInput<D>;
//
//     /** Emits when the datepicker is disabled. */
//     readonly _disabledChange = new Subject<boolean>();
//
//     /** Emits new selected date when selected date changes. */
//     readonly _selectedChanged = new Subject<D>();
//
//     constructor(private _overlay: Overlay,
//                 private _ngZone: NgZone,
//                 private _viewContainerRef: ViewContainerRef,
//                 @Inject(MAT_DATEPICKER_SCROLL_STRATEGY) private _scrollStrategy,
//                 @Optional() private _dateAdapter: DateAdapter<D>,
//                 @Optional() private _dir: Directionality,
//                 @Optional() @Inject(DOCUMENT) private _document: any) {
//         if (!this._dateAdapter) {
//             throw createMissingDateImplError('DateAdapter');
//         }
//     }
//
//     ngOnDestroy() {
//         this._inputSubscription.unsubscribe();
//         this._disabledChange.complete();
//     }
//
//     /** Selects the given date */
//     _select(date: D): void {
//         let oldValue = this._selected;
//         this._selected = date;
//         if (!this._dateAdapter.sameDate(oldValue, this._selected)) {
//             this._selectedChanged.next(date);
//         }
//     }
//
//     /** Emits the selected year in multiyear view */
//     _selectYear(normalizedYear: D): void {
//         this.yearSelected.emit(normalizedYear);
//     }
//
//     /** Emits selected month in year view */
//     _selectMonth(normalizedMonth: D): void {
//         this.monthSelected.emit(normalizedMonth);
//     }
//
//     /**
//      * Register an input with this datepicker.
//      * @param input The datepicker input to register with this datepicker.
//      */
//     _registerInput(input: CdkDatepickerInput<D>): void {
//         if (this._datepickerInput) {
//             throw Error('A MatDatepicker can only be associated with a single input.');
//         }
//         this._datepickerInput = input;
//         this._inputSubscription =
//             this._datepickerInput._valueChange.subscribe((value: D | null) => this._selected = value);
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
