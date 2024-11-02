import { $$ } from "../tools/common.js";

export const mochaHooks = {
  beforeAll(done: any) {
    (<any>this).timeout(20000);
    $$`./gradlew clean build -x test`.then(() => done());
  },
};
