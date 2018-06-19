/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs';

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

    /**
     * Emits whenever there is a state change that the header may need to respond to.
     */
    changes = new Subject<D>();


}
