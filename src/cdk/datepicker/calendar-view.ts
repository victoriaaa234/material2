/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs';
import {EventEmitter, Output} from '@angular/core';

/**
 * An abstract calendar that is used as part of the datepicker. This abstract calendar class
 * contains all necessary parts needed for a generic datepicker component.
 */
export abstract class CalendarView<D> {

    /** A date representing when to start the calendar. */
    abstract activeDate: D;

    /** The minimum selectable date. */
    abstract minDate: D | null;

    /** The maximum selectable date. */
    abstract maxDate: D | null;

    /** The currently selected date. */
    abstract selected: D | null;

    /** Emits when a new date is selected. */
    @Output() abstract readonly selectedChange = new Subject<D | null>();

    /** Emits when any date is activated. */
    @Output() abstract readonly activeDateChange = new Subject<D>();
}
