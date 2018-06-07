/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Prototype for the Datepicker CDK with example of Material Calendar that will implement the CDK.
 * For this prototype, I will be using the Angular Date component and then incorporating DateAdapter
 * as the new Date component after prototyping completion. The main functionality for the Datepicker
 * will exist in the CDK and the UI components will exist in the Material Calendar.
 */

import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ContentChild, ContentChildren,
    Injectable,
    Input, NgZone,
    QueryList} from '@angular/core';
import {Subject} from 'rxjs';
import {take} from 'rxjs/operators';


/**
 * CalendarView Component that will be part of the Datepicker CDK. This will be an abstract class
 * with three variables to be set (two of them are optional). These variables are the focus date,
 * the minimum date, and the maximum date. The default value for the focus date is today's date, and
 * setting the minimum and maximum date are optional. I will have a change detector that will detect
 * any changes made in any of the views that extend CalendarView.
 */
@Injectable()
abstract class CalendarView {
    abstract set date(value: Date);
    abstract set minDate(value: Date | null);
    abstract set maxDate(value: Date | null);
    readonly dateChanges = new Subject<Date>();
}

/**
 * Datepicker Component will be part of the Datepicker CDK. This will be the component that
 * developers will use and referencing when using the Datepicker Component. The Datepicker will have
 * the abstract CalendarView component as its child. This abstract CalendarView component will be
 * implemented by the Material Calendar component with its appropriate fields. Change detection will
 * also be implemented throughout the Datepicker and its extended views.
 */
@Component( {
    moduleId: module.id,
    selector: 'datepicker',
    template: `<ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Datepicker {
    @Input() date: Date;
    @Input() minDate: Date | null;
    @Input() maxDate: Date | null;
    @ContentChild(CalendarView) view: CalendarView;
}

/**
 * Datepicker Demo Component will show what the template of how to call the Datepicker may look
 * like for any particular user. For this example, I will specify all three inputs to the Calendar
 * component. In this example, all of the component views (month, year, and day) are included in the
 * calendar.
 */
@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
    template: `<datepicker><calendar [date]="date" [minDate]="minDate" [maxDate]="maxDate">
        <month></month><year></year><day></day></calendar></datepicker>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemo {
    date = new Date();
    minDate = new Date(2019, 3, 14);
    maxDate = new Date(2020, 4, 13);
}

/**
 * Calendar Component that will be part of the Material Calendar example. This will be a UI
 * component that extends CalendarView and works together with the Datepicker CDK. This is where the
 * user specifies how the information is shown on the page. The extension of CalendarView here will
 * allow the Calendar Component to set the three variables as the user wishes and mark to see if any
 * of the values have changed as the user manipulates the calendar. The calendar will have
 * @ContentChildren with multiple CalendarViews for the multiple month, year, and day views.
 *
 * In the future, we can implement another input that will allow the users to choose different views
 * as they wish. For example, only month and day views.
 */
@Component({
    moduleId: module.id,
    selector: 'calendar',
    template: `<div>start at: {{date}}</div>
    <div>min date: {{minDate}}</div>
    <div>max date: {{maxDate}}</div>
    <ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: CalendarView, useExisting: Calendar}]
})
export class Calendar extends CalendarView implements AfterContentInit {
    @Input() date: Date;
    @Input() minDate: Date | null;
    @Input() maxDate: Date | null;
  @ContentChildren(CalendarView) views: QueryList<CalendarView>;

  constructor(public zone: NgZone, public cdr: ChangeDetectorRef) {
      super();
  }

  /**
   * Because initialization of the content requires all of the views to communicate with each other,
   * we should update all of the instances of CalendarView so each component reflects the correct
   * focus date, minimum date, and maximum date. We will also check here if the minimum date exceeds
   * the maximum date, and if it does, log it and in the future, throw an exception.
   */
  ngAfterContentInit() {
      if (this.minDate != null && this.maxDate != null && this.minDate > this.maxDate) {
          console.log('Min date is greater than max date');
      } else {
          this.zone.onStable.pipe(take(1)).subscribe(() => {
              this.views.forEach(calendarInstance => {
                  // Initialize minimum date for each instance.
                  if (this.minDate != null && this.minDate >= this.date) {
                      calendarInstance.date = this.minDate;
                      this.date = this.minDate;
                      calendarInstance.minDate = this.minDate;
                  } else if (this.minDate != null) {
                      calendarInstance.date = this.date;
                      calendarInstance.minDate = this.minDate;
                  } else {
                      calendarInstance.date = this.date;
                  }

                  // Initialize maximum date for each instance.
                  if (this.maxDate != null && this.maxDate <= this.date) {
                      calendarInstance.maxDate = this.maxDate;
                      this.date = this.maxDate;
                      calendarInstance.date = this.date;
                  } else if (this.maxDate != null) {
                      calendarInstance.date = this.date;
                      calendarInstance.maxDate = this.maxDate;
                  } else {
                      calendarInstance.date = this.date;
                  }
              });
              this.cdr.markForCheck();
          });
      }
      this.views.forEach(calendarInstance => calendarInstance.dateChanges.subscribe((d) => {
          this.date = d;
          this.views.forEach(instance => instance.date = this.date);
          this.cdr.markForCheck();
      }));
  }
}

/**
 * Month Component that will extend CalendarView and has all of the components and functionality
 * necessary to implement the MonthView component in the Datepicker CDK. This includes going to the
 * next or previous months for the Datepicker date.
 */
@Component({
    moduleId: module.id,
    selector: 'month',
    template: `<div>month: {{date?.getMonth()}}
        <button (click)="nextMonth()">next month</button>
        <button (click)="prevMonth()">prev month</button>
    </div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: CalendarView, useExisting: MonthView},
        {provide: Calendar, useExisting: MonthView}]
})
export class MonthView extends CalendarView {
  @Input() date: Date;
  @Input() minDate: Date | null;
  @Input() maxDate: Date | null;
  newDate: Date;

  /**
   * Gets the next month from the current focus date, and changes the current focus date to that
   * new date. If the maximum month has been hit, then log to console and in the future, throw an
   * exception.
   */
  nextMonth() {
      this.newDate = new Date(this.date.getFullYear(), this.date.getMonth() + 1,
          this.date.getDate(), this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.maxDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
          if (this.maxDate.getTime() >= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          } else {
              console.log('Maximum month possible has been reached');
          }
      }
  }

  /**
   * Gets the previous month from the current focus date, and changes the current focus date to
   * that new date. If the minimum month has been hit, then log to console and in the future, throw
   * an exception.
   */
  prevMonth() {
      this.newDate = new Date(this.date.getFullYear(), this.date.getMonth() - 1,
          this.date.getDate(), this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.minDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
          if (this.minDate.getTime() <= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          } else {
              console.log('Minimum month possible has been reached');
          }
      }
  }
}

/**
 * Year Component that will extend CalendarView and has all of the components and functionality
 * necessary to implement the YearView component in the Datepicker CDK. This includes going to the
 * next or previous years for the Datepicker date.
 */
@Component({
    moduleId: module.id,
    selector: 'year',
    template: `<div>year: {{date?.getFullYear()}}
        <button (click)="nextYear()">next year</button>
        <button (click)="prevYear()">prev year</button>
    </div>`,
    providers: [{provide: CalendarView, useExisting: YearView},
        {provide: Calendar, useExisting: YearView}],
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class YearView extends CalendarView {
  @Input() date: Date;
  @Input() minDate: Date | null;
  @Input() maxDate: Date | null;
  newDate: Date;

  /**
   * Gets the next year from the current focus date, and changes the current focus date to
   * that new date. If the maximum year has been hit, then log to console and in the future, throw
   * an exception.
   */
  nextYear() {
      this.newDate = new Date(this.date.getFullYear() + 1, this.date.getMonth(),
          this.date.getDate(), this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.maxDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
          if (this.maxDate.getTime() >= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          } else {
              console.log('Maximum year possible has been reached');
          }
      }
  }

  /**
   * Gets the previous year from the current focus date, and changes the current focus date to
   * that new date. If the minimum year has been hit, then log to console and in the future, throw
   * and exception.
   */
  prevYear() {
      this.newDate = new Date(this.date.getFullYear() - 1, this.date.getMonth(),
          this.date.getDate(), this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.minDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
          if (this.minDate.getTime() <= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          } else {
              console.log('Minimum year possible has been reached');
          }
      }
  }
}

/**
 * Day Component that will extend CalendarView and has all of the components and functionality
 * necessary to implement the DayView component in the Datepicker CDK. This includes going to the
 * next or previous days for the Datepicker date.
 */
@Component({
    moduleId: module.id,
    selector: 'day',
    template: `<div>day: {{date?.getDay()}}
        <button (click)="nextDay()">next day</button>
        <button (click)="prevDay()">prev day</button>
    </div>`,
    providers: [{provide: CalendarView, useExisting: DayView},
        {provide: Calendar, useExisting: DayView}],
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class DayView extends CalendarView {
  @Input() date: Date;
  @Input() minDate: Date | null;
  @Input() maxDate: Date | null;
  newDate: Date;

  /**
   * Gets the previous day from the current focus date, and changes the current focus date to
   * that new date. If the maximum day has been reached, then log to console and in the future,
   * throw an exception.
   */
  nextDay() {
      this.newDate = new Date(this.date.getFullYear(), this.date.getMonth(),
          this.date.getDate() + 1, this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.maxDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
          if (this.maxDate.getTime() >= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          } else {
              console.log('Maximum day possible has been reached');
          }
      }
  }

  /**
   * Gets the previous day from the current focus date, and changes the current focus date to
   * that new date. If the minimum day has been reached, then log to console and in the future,
   * throw an exception.
   */
  prevDay() {
      this.newDate = new Date(this.date.getFullYear(), this.date.getMonth(),
          this.date.getDate() - 1, this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.minDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
          if (this.minDate.getTime() <= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          } else {
              console.log('Minimum day possible has been reached');
          }
      }
  }
}
