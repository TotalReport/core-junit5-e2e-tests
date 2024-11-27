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

describe("timeout abortion in before all test", () => {
  test("creates correct entities", async () => {
    const javaTestName =
      "com.craftens.totalreport.junit5example.TimeoutAbortionInBeforeAllTest";
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
    const [beforeAll] = entities.items.filter(
      (item) => item.entityType === "before test"
    );
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
          createdTimestamp: expect.closeToDate(timestampBeforeTest, 3000),
          startedTimestamp: expect.closeToDate(timestampBeforeTest, 3000),
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
            beforeAll?.startedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeAll?.createdTimestamp!,
            beforeAll?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeAll?.startedTimestamp!,
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
            beforeAll?.finishedTimestamp!,
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
        total: 3,
      },
    });
  });
});
