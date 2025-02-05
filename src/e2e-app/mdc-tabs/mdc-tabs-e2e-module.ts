/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MdcTabsE2e} from './mdc-tabs-e2e';

@NgModule({
  imports: [MatTabsModule, MatFormFieldModule, MatInputModule],
  declarations: [MdcTabsE2e],
})
export class MdcTabsE2eModule {}
