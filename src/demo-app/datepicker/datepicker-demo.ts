/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ContentChild, ContentChildren,
    Host,
    Inject,
    Injectable,
    Input, NgZone,
    OnDestroy, QueryList, ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatCalendar} from '@angular/material';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats, ThemePalette} from '@angular/material/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';

@Injectable()
abstract class CalendarView {
    abstract set date(value: Date);
    abstract set minDate(value: Date | null);
    abstract set maxDate(value: Date | null);
    readonly dateChanges = new Subject<Date>();
}

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

    // constructor(public zone: NgZone) {}
    //
    // ngAfterContentInit() {
    //     this.view.ngAfterContentInit();
    // }

}

@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  // template: '<datepicker><month></month><year></year><day></day></datepicker>',
    template: `<datepicker><calendar [date]="date" [minDate]="minDate" [maxDate]="maxDate">
        <month></month><year></year><day></day></calendar></datepicker>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemo {
    date = new Date();
    minDate = new Date(2019, 3, 14);
    maxDate = new Date(2020, 4, 13);
}

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
  // date = new Date();
  @ContentChildren(CalendarView) views: QueryList<CalendarView>;

  constructor(public zone: NgZone, public cdr: ChangeDetectorRef) {
      super();
  }

    ngAfterContentInit() {
        // console.log(this.view);
        this.zone.onStable.pipe(take(1)).subscribe(() => {
            this.views.forEach(calendarInstance => {
                if (this.minDate != null && this.minDate >= this.date) {
                    calendarInstance.date = this.minDate;
                    this.date = this.minDate;
                    calendarInstance.minDate = this.minDate;
                } else {
                    calendarInstance.date = this.date;
                }

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
        // this.view.date = this.date
        this.views.forEach(calendarInstance => calendarInstance.dateChanges.subscribe((d) => {
            // console.log(this.startAt);
            // console.log(d);
            this.date = d;
            this.views.forEach(instance => instance.date = this.date);
            this.cdr.markForCheck();
            // calendarInstance.date = this.date;
        }));
        // view.dateChanges.subscribe((d) => {
        //     this.date = d;
        //     this.view.date = d;
        // });
    }
}

@Component({
    moduleId: module.id,
    selector: 'month',
    template: `<div>month: {{date?.getMonth()}}
        <button (click)="nextDate()">next month</button>
        <button (click)="prevDate()">prev month</button>
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

  nextDate() {
      this.newDate = new Date(this.date.getFullYear(), this.date.getMonth() + 1,
          this.date.getDate(), this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.minDate == null && this.maxDate == null) {
          this.dateChanges.next(this.newDate);
      } else if (this.minDate == null && this.maxDate != null) {
          if (this.maxDate.getTime() >= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          }
      } else if (this.minDate != null && this.maxDate != null) {
          if (this.maxDate.getTime() >= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          }
      }
    }

    prevDate() {
      this.newDate = new Date(this.date.getFullYear(), this.date.getMonth() - 1,
          this.date.getDate(), this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.minDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
          if (this.minDate.getTime() <= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          }
      }
    }
}

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

  nextYear() {
      this.newDate = new Date(this.date.getFullYear() + 1, this.date.getMonth(),
          this.date.getDate(), this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.minDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
            if (this.minDate.getTime() > this.newDate.getTime()) {} else {
                this.dateChanges.next(this.newDate);
            }
      }
  }

  prevYear() {
      this.newDate = new Date(this.date.getFullYear() - 1, this.date.getMonth(),
          this.date.getDate(), this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());

      if (this.minDate == null) {
          console.log('hello');
          this.dateChanges.next(this.newDate);
      } else {
          if (this.minDate.getTime() <= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          }
      }
  }

}

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

  nextDay() {
      this.newDate = new Date(this.date.getFullYear(), this.date.getMonth(),
          this.date.getDate() + 1, this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.minDate == null) {
        this.dateChanges.next(this.newDate);
      } else {
            if (this.minDate.getTime() > this.newDate.getTime()) {} else {
                this.dateChanges.next(this.newDate);
            }
      }
  }

  prevDay() {
      this.newDate = new Date(this.date.getFullYear(), this.date.getMonth(),
          this.date.getDate() - 1, this.date.getHours(), this.date.getMinutes(),
          this.date.getSeconds());
      if (this.minDate == null) {
          this.dateChanges.next(this.newDate);
      } else {
          if (this.minDate.getTime() <= this.newDate.getTime()) {
              this.dateChanges.next(this.newDate);
          }
      }
  }
}
