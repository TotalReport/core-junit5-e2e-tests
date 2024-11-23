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

describe("exception in before each", () => {
  test("creates correct entities", async () => {
    const javaTestName =
      "com.craftens.totalreport.junit5example.ExceptionInBeforeEachTest";
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
        limit: 10,
      }
    );

    const context = entities.items.filter(
      (item) => item.entityType === "test context"
    )[0];
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
          createdTimestamp: expect.betweenDatesOrEqual(
            context?.startedTimestamp!,
            beforeAll?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            context?.startedTimestamp!,
            beforeAll?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
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
          title: javaTestName + "#beforeEach1",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeAll?.finishedTimestamp!,
            beforeEach1?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeAll?.finishedTimestamp!,
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
            beforeEach2?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach1?.finishedTimestamp!,
            beforeEach2?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach2?.startedTimestamp!,
            afterAll?.createdTimestamp!
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
            afterEach?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach2?.finishedTimestamp!,
            afterEach?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach?.startedTimestamp!,
            afterAll?.finishedTimestamp!
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
            afterAll?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach?.finishedTimestamp!,
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
        limit: 10,
        total: 6,
      },
    });
  });
});
