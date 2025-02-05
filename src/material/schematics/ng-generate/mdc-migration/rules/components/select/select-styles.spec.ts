import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('select styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['select'], runner, cliAppTree);
    expect(tree.readContent(THEME_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  describe('mixin migrations', () => {
    it('should replace the old theme with the new ones', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.select-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.mdc-select-theme($theme);
        @include mat.mdc-select-typography($theme);
        @include mat.mdc-core-theme($theme);
        @include mat.mdc-core-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.select-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.mdc-select-theme($theme);
        @include arbitrary.mdc-select-typography($theme);
        @include arbitrary.mdc-core-theme($theme);
        @include arbitrary.mdc-core-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.select-theme($light-theme);
        @include mat.select-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.mdc-select-theme($light-theme);
        @include mat.mdc-select-typography($light-theme);
        @include mat.mdc-core-theme($light-theme);
        @include mat.mdc-core-typography($light-theme);
        @include mat.mdc-select-theme($dark-theme);
        @include mat.mdc-select-typography($dark-theme);
        @include mat.mdc-core-theme($dark-theme);
        @include mat.mdc-core-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.select-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.mdc-select-theme($theme);
        @include mat.mdc-select-typography($theme);
        @include mat.mdc-core-theme($theme);
        @include mat.mdc-core-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-select classname', async () => {
      await runMigrationTest(
        `
        .mat-select {
          padding: 16px;
        }
      `,
        `
        .mat-mdc-select {
          padding: 16px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-select {
          padding: 16px;
        }
        .mat-option {
          padding: 16px;
        }
      `,
        `
        .mat-mdc-select {
          padding: 16px;
        }
        .mat-mdc-option {
          padding: 16px;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-select, .another-class {
          padding: 16px;
        }
      `,
        `
        .some-class.mat-mdc-select, .another-class {
          padding: 16px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-select,
        .another-class { padding: 16px; }
      `,
        `
        .some-class,
        .mat-mdc-select,
        .another-class { padding: 16px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-select-value {
          color: red;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of select that may no longer apply for the MDC version. */

        .mat-select-value {
          color: red;
        }
      `,
      );
    });

    it('should not add comment for legacy selector that also starts with deprecated prefix', async () => {
      await runMigrationTest(
        `
        .mat-select-panel {
          padding: 16px;
        }
      `,
        `
        .mat-mdc-select-panel {
          padding: 16px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-select-value {
          color: red;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of select that may no longer apply for the MDC version. */

        .some-class
        .mat-select-value {
          color: red;
        }
      `,
      );
    });

    it('should update the legacy mat-select class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-select.some-class, .mat-select-value {
          padding: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of select that may no longer apply for the MDC version. */

        .mat-mdc-select.some-class, .mat-select-value {
          padding: 16px;
        }
      `,
      );
    });
  });
});
