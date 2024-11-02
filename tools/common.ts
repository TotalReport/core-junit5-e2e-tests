import { $, usePowerShell } from "zx";

if (process.platform === "win32") {
  usePowerShell();
}

export const $$ = $({
  quiet: true,
  cwd: process.env["JUNIT5_TESTS_ROOT"]!,
});
