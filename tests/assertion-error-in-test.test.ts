import { contract } from "@total-report/core-contract/contract";
import { LaunchesGenerator } from "@total-report/core-entities-generator/launch";
import { DEFAULT_TEST_STATUSES } from "@total-report/core-schema/constants";
import { initClient } from "@ts-rest/core";
import { expect } from "earl";
import { describe, test } from "mocha";
import { CoreClient } from "../tools/client/core-client.js";
import { $$ } from "../tools/common.js";
import "../tools/earl-extensions.js";

const CORE_SERVICE_ENDPOINT = process.env["CORE_SERVICE_ENDPOINT"]!;
const CORE_SERVICE_URL_PROPERTY =
  "-Dcom.craftens.totalreport.url=" + CORE_SERVICE_ENDPOINT;

const client = initClient(contract, {
  baseUrl: CORE_SERVICE_ENDPOINT,
  baseHeaders: {},
});

const coreClient = new CoreClient(client);

describe("assertion error in test", () => {
  test("creates correct entities", async () => {
    const javaTestName =
      "com.craftens.totalreport.junit5example.AssertionErrorInTestTest";
    const launch = await new LaunchesGenerator(client).create();

    const props = [
      CORE_SERVICE_URL_PROPERTY,
      `-Dcom.craftens.totalreport.report.id=${launch.reportId}`,
      `-Dcom.craftens.totalreport.launch.id=${launch.id}`,
    ];

    const timestampBeforeTest = new Date();

    await $$`./gradlew :test --tests "${javaTestName}" ${props}`.catch(
      (error) => error
    );

    const entities = await coreClient.entities.find(
      {
        launchId: launch.id,
      },
      {
        offset: 0,
        limit: 20,
      }
    );

    const [context] = entities.items.filter(
      (item) => item.entityType === "test context"
    );
    const [beforeAll, beforeEach1, beforeEach2, beforeEach3] = entities.items.filter(
      (item) => item.entityType === "before test"
    );
    const [test1, test2, test3] = entities.items.filter((item) => item.entityType === "test");
    const [afterEach1, afterEach2, afterEach3, afterAll] = entities.items.filter(
      (item) => item.entityType === "after test"
    );

    expect(entities).toEqual({
      items: [
        {
          launchId: launch.id,
          entityType: "test context",
          id: expect.anything(),
          title: javaTestName,
          createdTimestamp: expect.closeToDate(timestampBeforeTest, 2000),
          startedTimestamp: expect.closeToDate(timestampBeforeTest, 2000),
          finishedTimestamp: expect.closeToDate(timestampBeforeTest, 5000),
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeAll",
          createdTimestamp: expect.betweenDates(
            context?.startedTimestamp!,
            beforeAll?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            context?.startedTimestamp!,
            beforeAll?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            beforeAll?.startedTimestamp!,
            beforeEach1?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeEach",
          createdTimestamp: expect.betweenDates(
            beforeAll?.finishedTimestamp!,
            beforeEach1?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            beforeAll?.finishedTimestamp!,
            beforeEach1?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            beforeEach1?.startedTimestamp!,
            beforeEach2?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "test",
          id: expect.anything(),
          title: javaTestName + "#test1",
          createdTimestamp: expect.betweenDates(
            beforeEach1?.finishedTimestamp!,
            test1?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            beforeEach1?.finishedTimestamp!,
            test1?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            test1?.startedTimestamp!,
            afterEach1?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach",
          createdTimestamp: expect.betweenDates(
            test1?.finishedTimestamp!,
            afterEach1?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            test1?.finishedTimestamp!,
            afterEach1?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            afterEach1?.startedTimestamp!,
            beforeEach2?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeEach",
          createdTimestamp: expect.betweenDates(
            afterEach1?.finishedTimestamp!,
            beforeEach2?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            afterEach1?.finishedTimestamp!,
            beforeEach2?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            beforeEach2?.startedTimestamp!,
            test2?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "test",
          id: expect.anything(),
          title: javaTestName + "#test2",
          createdTimestamp: expect.betweenDates(
            beforeEach2?.finishedTimestamp!,
            test2?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            beforeEach2?.finishedTimestamp!,
            test2?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            test2?.startedTimestamp!,
            afterEach2?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.PRODUCT_BUG.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach",
          createdTimestamp: expect.betweenDates(
            test2?.finishedTimestamp!,
            afterEach2?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            test2?.finishedTimestamp!,
            afterEach2?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            afterEach2?.startedTimestamp!,
            beforeEach3?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeEach",
          createdTimestamp: expect.betweenDates(
            afterEach2?.finishedTimestamp!,
            beforeEach3?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            afterEach2?.finishedTimestamp!,
            beforeEach3?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            beforeEach3?.startedTimestamp!,
            test3?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "test",
          id: expect.anything(),
          title: javaTestName + "#test3",
          createdTimestamp: expect.betweenDates(
            beforeEach3?.finishedTimestamp!,
            test3?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            beforeEach3?.finishedTimestamp!,
            test3?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            test3?.startedTimestamp!,
            afterEach3?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach",
          createdTimestamp: expect.betweenDates(
            test3?.finishedTimestamp!,
            afterEach3?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            test3?.finishedTimestamp!,
            afterEach3?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            afterEach3?.startedTimestamp!,
            afterAll?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterAll",
          createdTimestamp: expect.betweenDates(
            afterEach3?.finishedTimestamp!,
            afterAll?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDates(
            afterEach3?.finishedTimestamp!,
            afterAll?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDates(
            afterAll?.startedTimestamp!,
            context?.finishedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
      ],
      pagination: {
        offset: 0,
        limit: 20,
        total: 12,
      },
    });
  });
});
