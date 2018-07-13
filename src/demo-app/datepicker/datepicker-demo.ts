/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Prototype for the Timepicker CDK with example of Material Time that will implement the CDK.
 * For this prototype, I will be using the Angular Date/Time component and then incorporating DateAdapter
 * as the new Date/Time component after prototyping completion. The main functionality for the Timepicker
 * will exist in the CDK and the UI components will exist in the Material Time.
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
 * TimeView Component that will be part of the Timepicker CDK. This will be an abstract class
 * with three variables to be set (two of them are optional). These variables are the focus date,
 * the minimum date, and the maximum date. The default value for the focus date is today's date, and
 * setting the minimum and maximum date are optional. I will have a change detector that will detect
 * any changes made in any of the views that extend TimeView.
 */
@Injectable()
abstract class TimeView {
    abstract set time(value: Date);
    abstract set minTime(value: Date | null);
    abstract set maxTime(value: Date | null);
    readonly timeChanges = new Subject<Date>();
}

/**
 * Timepicker Component will be part of the Datetimepicker CDK. This will be the component that
 * developers will use and referencing when using the Datetimepicker Component. The Timepicker will have
 * the abstract TimeView component as its child. This abstract TimeView component will be
 * implemented by the Material Time component with its appropriate fields. Change detection will
 * also be implemented throughout the Datetimepicker and its extended views. The Timepicker Component would
 * actually be the Datetimepicker Component in actual implementation.
 */
@Component( {
    moduleId: module.id,
    selector: 'timepicker',
    template: `<ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timepicker {
    @Input() time: Date;
    @Input() minTime: Date | null;
    @Input() maxTime: Date | null;
    @ContentChild(TimeView) view: TimeView;
}

/**
 * Timepicker Demo Component will show what the template of how to call the Timepicker may look
 * like for any particular user. For this example, I will specify all three inputs to the Time
 * component. In this example, all of the component views (time) are included in the
 * material time component.
 */
@Component({
  moduleId: module.id,
  selector: 'timepicker-demo',
    template: `<timepicker><mat-time [time]="time" [minTime]="minTime" [maxTime]="maxTime">
        <time></time></mat-time></timepicker>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerDemo {
    time = new Date();
    minTime = new Date(2019, 3, 14, 3,30,30);
    maxTime = new Date(2020, 4, 13,4,30,30);
}

/**
 * Material Time Component that will be part of the Material Time example. This will be a UI
 * component that extends TimeView and works together with the Timepicker CDK. This is where the
 * user specifies how the information is shown on the page. The extension of TimeView here will
 * allow the Material Time Component to set the three variables as the user wishes and mark to see if any
 * of the values have changed as the user manipulates the material time time. The material time component will have
 * @ContentChild with multiple Tim for the multiple month, year, and day views.
 *
 * In the future, we can implement another input that will allow the users to choose different views
 * as they wish. For example, only month and day views.
 */
@Component({
    moduleId: module.id,
    selector: 'time',
    template: `<div>start at: {{time}}</div>
    <div>min date: {{minTime}}</div>
    <div>max date: {{maxTime}}</div>
    <ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: TimeView, useExisting: MatTime}]
})
export class MatTime extends TimeView implements AfterContentInit {
    @Input() time: Date;
    @Input() minTime: Date | null;
    @Input() maxTime: Date | null;
  @ContentChildren(TimeView) views: QueryList<TimeView>;

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
      if (this.minTime != null && this.maxTime != null && this.minTime > this.maxDate) {
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

