/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
// import {MatCalendar, MatCalendarHeader} from './calendar';
// import {MatCalendarBody} from './calendar-body';
// import {
//     CdkDatepicker,
//     MatDatepickerContent,
// } from './datepicker';
// import {CdkDatepickerInput} from './datepicker-input';
import {CdkDatepickerIntl} from './datepicker-intl';
import {CalendarView} from '@angular/cdk/datepicker/calendar-view';
// import {MatDatepickerToggle, MatDatepickerToggleIcon} from './datepicker-toggle';
// import {CdkMonth} from './month';
// import {CdkMultiYear} from './multi-year';
// import {CdkYear} from './year';

const EXPORTED_DECLARATIONS = [
    // CdkCalendar,
    // CdkDatepicker,
    // CdkDatepickerInput,
    CdkDatepickerIntl,
    CalendarView,
    // CdkMonth,
    // CdkYear,
    // CdkMultiYear,

    // MatDatepickerContent,
];
@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        A11yModule,
        PortalModule,
    ],
    exports: [EXPORTED_DECLARATIONS],
    declarations: EXPORTED_DECLARATIONS,
})
export class CdkDatepickerModule {}
