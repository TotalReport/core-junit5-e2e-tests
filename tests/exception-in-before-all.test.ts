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

describe("exception in before all", () => {
  test("creates correct entities", async () => {
    const javaTestName =
      "com.craftens.totalreport.junit5example.ExceptionInBeforeAllTest";
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
    const [beforeAll1, beforeAll2] = entities.items.filter(
      (item) => item.entityType === "before test"
    );
    const test = entities.items.filter((item) => item.entityType === "test")[0];
    const [afterAll] = entities.items.filter(
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
          title: javaTestName + "#beforeAll1",
          createdTimestamp: expect.betweenDatesOrEqual(
            context?.startedTimestamp!,
            beforeAll1?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            context?.startedTimestamp!,
            beforeAll1?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeAll1?.startedTimestamp!,
            beforeAll2?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeAll2",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeAll1?.finishedTimestamp!,
            beforeAll2?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeAll1?.finishedTimestamp!,
            beforeAll2?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeAll2?.startedTimestamp!,
            afterAll?.createdTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.AUTOMATION_BUG.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterAll",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeAll1?.finishedTimestamp!,
            afterAll?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeAll1?.finishedTimestamp!,
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
        total: 4,
      },
    });
  });
});
