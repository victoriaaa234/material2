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
    Input, NgZone, QueryList
} from '@angular/core';
import {Subject} from 'rxjs';


/**
 * TimeView Component that will be part of the Timepicker CDK. This will be an abstract class
 * with three variables to be set (two of them are optional). These variables are the focus time,
 * the minimum time, and the maximum time. The default value for the focus time is the current time, and
 * setting the minimum and maximum time are optional. I will have a change detector that will detect
 * any changes made in any of the views that extend TimeView.
 */
@Injectable()
abstract class TimeView {
    abstract set currentTime(value: Date);
    abstract set minTime(value: Date | null);
    abstract set maxTime(value: Date | null);
    readonly timeChanges = new Subject<Date>();
}

/**
 * Timepicker Component will be part of the Datetimepicker CDK. This will be the component that
 * developers will use and reference when using the Datetimepicker Component. The Timepicker will have
 * the abstract TimeView component as its child. This abstract TimeView component will be
 * implemented by the Material Time component with its appropriate fields. Change detection will
 * also be implemented throughout the TimeView and its extended views. The Timepicker Component would
 * actually be the Datetimepicker Component in actual implementation.
 */
@Component({
    moduleId: module.id,
    selector: 'timepicker',
    template: `<ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timepicker {
    @Input() currentTime: Date;
    @Input() minTime: Date | null;
    @Input() maxTime: Date | null;
    @ContentChild(TimeView) view: TimeView;
}

/**
 * Timepicker Demo Component will show what the template of how to call the Timepicker may look
 * like for any particular user. For this example, I will specify all three inputs to the Time
 * component. In this example, all of the component views (Time) are included in the
 * material time component.
 */
@Component({
    moduleId: module.id,
    selector: 'datepicker-demo',
    template: `<timepicker><mat-time [currentTime]="currentTime" [minTime]="minTime" [maxTime]="maxTime">
        <time></time></mat-time></timepicker>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemo {
    currentTime = new Date();
    minTime = new Date(2019, 3, 14, 3, 30, 30);
    maxTime = new Date(2019, 3, 14, 4, 30, 30);
}

/**
 * Material Time Component that will be part of the Material Time example. This will be a UI
 * component that extends TimeView and works together with the Timepicker CDK. This is where the
 * user specifies how the information is shown on the page. The extension of TimeView here will
 * allow the Material Time Component to set the three variables as the user wishes and mark to see if any
 * of the values have changed as the user manipulates the time. The material time component will have
 * @ContentChild with a time view.
 *
 * In the future, we can implement more views that extend TimeView. For example: hour, minute, or second views.
 * We could also implement another input that will allow the users to choose different views as they wish.
 * For example, only hour and second views.
 */
@Component({
    moduleId: module.id,
    selector: 'mat-time',
    template: `<div>start at: {{currentTime}}</div>
        <div>min time: {{minTime}}</div>
        <div>max time: {{maxTime}}</div>
        <ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: TimeView, useExisting: MatTime}]
})
export class MatTime extends TimeView implements AfterContentInit {
    @Input() currentTime: Date;
    @Input() minTime: Date | null;
    @Input() maxTime: Date | null;
    @ContentChildren(TimeView) views: QueryList<TimeView>;

    constructor(public zone: NgZone, public cdr: ChangeDetectorRef) {
        super();
    }

    /**
     * We will check here if the minimum time exceeds the maximum time, and if it does,
     * log it and in the future, throw an exception.
     */
    ngAfterContentInit() {
        if (this.minTime != null && this.maxTime != null && this.minTime > this.maxTime) {
            console.log('Min time is greater than max time');
        } else {
                this.views.forEach(timeInstance => {
                    // Initialize minimum time for each instance.
                    if (this.minTime != null && this.minTime >= this.currentTime) {
                        timeInstance.currentTime = this.minTime;
                        this.currentTime = this.minTime;
                        timeInstance.minTime = this.minTime;
                    } else if (this.minTime != null) {
                        timeInstance.currentTime = this.currentTime;
                        timeInstance.minTime = this.minTime;
                    } else {
                        timeInstance.currentTime = this.currentTime;
                    }

                    // Initialize maximum time for each instance.
                    if (this.maxTime != null && this.maxTime <= this.currentTime) {
                        timeInstance.maxTime = this.maxTime;
                        this.currentTime = this.maxTime;
                        timeInstance.currentTime = this.currentTime;
                    } else if (this.maxTime != null) {
                        timeInstance.currentTime = this.currentTime;
                        timeInstance.maxTime = this.maxTime;
                    } else {
                        timeInstance.currentTime = this.currentTime;
                    }
                });
                this.cdr.markForCheck();
        }
        this.views.forEach(timeInstance => timeInstance.timeChanges.subscribe((d) => {
            this.currentTime = d;
            this.views.forEach(instance => instance.currentTime = this.currentTime);
            this.cdr.markForCheck();
        }));
    }
}

/**
 * Time Component that will extend TimeView and has all of the components and functionality
 * necessary to implement the TimeView component in the Timepicker CDK. This includes going to the
 * next or previous time for the Timepicker time.
 */
@Component({
    moduleId: module.id,
    selector: 'time',
    template: `<div>time:
            hour: {{currentTime?.getHours()}}
            minute: {{currentTime?.getMinutes()}}
            second: {{currentTime?.getSeconds()}}
            <button (click)="nextHour()">next hour</button>
            <button (click)="prevHour()">prev hour</button>
            <button (click)="nextMinute()">next minute</button>
            <button (click)="prevMinute()">prev minute</button>
            <button (click)="nextSecond()">next second</button>
            <button (click)="prevSecond()">prev second</button>
        </div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: TimeView, useExisting: Time},
        {provide: MatTime, useExisting: Time}]
})
export class Time extends TimeView {
    @Input() currentTime: Date;
    @Input() minTime: Date | null;
    @Input() maxTime: Date | null;
    newTime: Date;

    /**
     * Gets the next time from the current focus time, and changes the current focus time to that
     * new time. If the maximum hour has been hit, then log to console and in the future, throw an
     * exception.
     */
    nextHour() {
        this.newTime = new Date(this.currentTime.getFullYear(), this.currentTime.getMonth(),
            this.currentTime.getDate(), this.currentTime.getHours() + 1, this.currentTime.getMinutes(),
            this.currentTime.getSeconds());
        if (this.maxTime == null) {
            this.timeChanges.next(this.newTime);
        } else {
            if (this.maxTime.getTime() >= this.newTime.getTime()) {
                this.timeChanges.next(this.newTime);
            } else {
                console.log('Maximum hour possible has been reached');
            }
        }
    }


    /**
     * Gets the previous hour from the current focus time, and changes the current focus time to
     * that new time. If the minimum hour has been hit, then log to console and in the future, throw
     * an exception.
     */
    prevHour() {
        this.newTime = new Date(this.currentTime.getFullYear(), this.currentTime.getMonth(),
            this.currentTime.getDate(), this.currentTime.getHours() - 1, this.currentTime.getMinutes(),
            this.currentTime.getSeconds());
        if (this.minTime == null) {
            this.timeChanges.next(this.newTime);
        } else {
            if (this.minTime.getTime() <= this.newTime.getTime()) {
                this.timeChanges.next(this.newTime);
            } else {
                console.log('Minimum hour possible has been reached');
            }
        }
    }

    /**
     * Gets the next minute from the current focus time, and changes the current focus time to that
     * new time. If the maximum minute has been hit, then log to console and in the future, throw an
     * exception.
     */
    nextMinute() {
        this.newTime = new Date(this.currentTime.getFullYear(), this.currentTime.getMonth(),
            this.currentTime.getDate(), this.currentTime.getHours(), this.currentTime.getMinutes() + 1,
            this.currentTime.getSeconds());
        if (this.maxTime == null) {
            this.timeChanges.next(this.newTime);
        } else {
            if (this.maxTime.getTime() >= this.newTime.getTime()) {
                this.timeChanges.next(this.newTime);
            } else {
                console.log('Maximum minute possible has been reached');
            }
        }
    }

    /**
     * Gets the previous minute from the current focus time, and changes the current focus time to
     * that new time. If the minimum minute has been hit, then log to console and in the future, throw
     * an exception.
     */
    prevMinute() {
        this.newTime = new Date(this.currentTime.getFullYear(), this.currentTime.getMonth(),
            this.currentTime.getDate(), this.currentTime.getHours(), this.currentTime.getMinutes() - 1,
            this.currentTime.getSeconds());
        if (this.minTime == null) {
            this.timeChanges.next(this.newTime);
        } else {
            if (this.minTime.getTime() <= this.newTime.getTime()) {
                this.timeChanges.next(this.newTime);
            } else {
                console.log('Minimum minute possible has been reached');
            }
        }
    }

    /**
     * Gets the next second from the current focus date, and changes the current focus date to that
     * new date. If the maximum second has been hit, then log to console and in the future, throw an
     * exception.
     */
    nextSecond() {
        this.newTime = new Date(this.currentTime.getFullYear(), this.currentTime.getMonth(),
            this.currentTime.getDate(), this.currentTime.getHours(), this.currentTime.getMinutes(),
            this.currentTime.getSeconds() + 1);
        if (this.maxTime == null) {
            this.timeChanges.next(this.newTime);
        } else {
            if (this.maxTime.getTime() >= this.newTime.getTime()) {
                this.timeChanges.next(this.newTime);
            } else {
                console.log('Maximum second possible has been reached');
            }
        }
    }

    /**
     * Gets the previous month from the current focus date, and changes the current focus date to
     * that new date. If the minimum month has been hit, then log to console and in the future, throw
     * an exception.
     */
    prevSecond() {
        this.newTime = new Date(this.currentTime.getFullYear(), this.currentTime.getMonth(),
            this.currentTime.getDate(), this.currentTime.getHours(), this.currentTime.getMinutes(),
            this.currentTime.getSeconds() - 1);
        if (this.minTime == null) {
            this.timeChanges.next(this.newTime);
        } else {
            if (this.minTime.getTime() <= this.newTime.getTime()) {
                this.timeChanges.next(this.newTime);
            } else {
                console.log('Minimum second possible has been reached');
            }
        }
    }
}

