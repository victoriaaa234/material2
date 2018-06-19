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
import {
    CdkDatepicker,
} from './datepicker';
import {CdkDatepickerInput} from './datepicker-input';

const EXPORTED_DECLARATIONS = [
    CdkDatepicker,
    CdkDatepickerInput,
];

@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        A11yModule,
        PortalModule,
    ],
    exports: EXPORTED_DECLARATIONS,
    declarations: EXPORTED_DECLARATIONS,
})
export class CdkDatepickerModule {}
