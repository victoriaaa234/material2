import {Component} from '@angular/core';
import {CalendarView} from '@angular/cdk/datepicker';

/** @title CDK Datepicker start date */
@Component({
    selector: 'cdk-datepicker-start-view-example',
    templateUrl: 'cdk-datepicker-start-view-example.html',
    styleUrls: ['cdk-datepicker-start-view-example.css'],
})
export class CdkDatepickerStartViewExample {
    startDate = new Date(1990, 0, 1);
}

// Implement CalendarView component example