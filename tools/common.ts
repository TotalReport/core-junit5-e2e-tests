import { $, usePowerShell } from "zx";

usePowerShell();

export const $$ = $({
  quiet: true,
  cwd: process.env["JUNIT5_TESTS_ROOT"]!,
});
