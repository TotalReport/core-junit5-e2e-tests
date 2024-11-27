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

describe("before each", () => {
  test("timeout assertion leads to automation bug status", async () => {
    const javaTestName =
      "com.craftens.totalreport.junit5example.BeforeEachTimeoutAssertionTest";
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
    const [beforeAll, beforeEach1, beforeEach2] = entities.items.filter(
      (item) => item.entityType === "before test"
    );
    const [test] = entities.items.filter((item) => item.entityType === "test");
    const [afterEach, afterAll] = entities.items.filter(
      (item) => item.entityType === "after test"
    );

    expect(entities).toEqual({
      items: [
        {
          launchId: launch.id,
          entityType: "test context",
          id: expect.anything(),
          title: javaTestName,
          createdTimestamp: expect.closeToDate(timestampBeforeTest, 4000),
          startedTimestamp: expect.closeToDate(timestampBeforeTest, 4000),
          finishedTimestamp: expect.closeToDate(timestampBeforeTest, 5000),
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeAll",
          createdTimestamp: expect.betweenDatesOrEqual(
            context?.startedTimestamp!,
            beforeAll?.createdTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeAll?.createdTimestamp!,
            beforeAll?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeAll?.startedTimestamp!,
            beforeEach1?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeEach1",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeAll?.finishedTimestamp!,
            beforeEach1?.startedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach1?.createdTimestamp!,
            beforeEach1?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach1?.startedTimestamp!,
            beforeEach2?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeEach2",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeEach1?.finishedTimestamp!,
            beforeEach2?.startedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach2?.createdTimestamp!,
            beforeEach2?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach2?.startedTimestamp!,
            afterEach?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.AUTOMATION_BUG.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeEach2?.finishedTimestamp!,
            afterEach?.startedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach?.createdTimestamp!,
            afterEach?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach?.startedTimestamp!,
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
          createdTimestamp: expect.betweenDatesOrEqual(
            afterEach?.finishedTimestamp!,
            afterAll?.startedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterAll?.createdTimestamp!,
            afterAll?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterAll?.startedTimestamp!,
            context?.finishedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
      ],
      pagination: {
        offset: 0,
        limit: 20,
        total: 6,
      },
    });
  });
});
