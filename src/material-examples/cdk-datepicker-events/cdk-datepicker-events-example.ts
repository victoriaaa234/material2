import {Component} from '@angular/core';
import {CdkDatepickerInputEvent} from '@angular/cdk/datepicker';

/** @title CDK Datepicker input and change events */
@Component({
    selector: 'cdk-datepicker-events-example',
    templateUrl: 'cdk-datepicker-events-example.html',
    styleUrls: ['cdk-datepicker-events-example.css'],
})
export class CdkDatepickerEventsExample {
    events: string[] = [];

    addEvent(type: string, event: CdkDatepickerInputEvent<Date>) {
        this.events.push(`${type}: ${event.value}`);
    }
}
