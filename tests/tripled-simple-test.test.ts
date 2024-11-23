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

describe("tripled simple test", () => {
  test("creates correct entities", async () => {
    const javaTestName =
      "com.craftens.totalreport.junit5example.TripledSimpleTest";
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
        limit: 30,
      }
    );

    const [context] = entities.items.filter(
      (item) => item.entityType === "test context"
    );

    const [
      beforeAll1,
      beforeAll2,
      beforeAll3,
      beforeEach11,
      beforeEach12,
      beforeEach13,
      beforeEach21,
      beforeEach22,
      beforeEach23,
      beforeEach31,
      beforeEach32,
      beforeEach33,
    ] = entities.items.filter((item) => item.entityType === "before test");

    const [test1, test2, test3] = entities.items.filter(
      (item) => item.entityType === "test"
    );

    const [
      afterEach11,
      afterEach12,
      afterEach13,
      afterEach21,
      afterEach22,
      afterEach23,
      afterEach31,
      afterEach32,
      afterEach33,
      afterAll1,
      afterAll2,
      afterAll3,
    ] = entities.items.filter((item) => item.entityType === "after test");

    expect(entities).toEqual({
      items: [
        {
          launchId: launch.id,
          entityType: "test context",
          id: expect.anything(),
          title: javaTestName,
          createdTimestamp: expect.closeToDate(timestampBeforeTest, 2000),
          startedTimestamp: expect.closeToDate(timestampBeforeTest, 2000),
          finishedTimestamp: expect.closeToDate(timestampBeforeTest, 11000),
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
            beforeAll3?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeAll3",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeAll2?.finishedTimestamp!,
            beforeAll3?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeAll2?.finishedTimestamp!,
            beforeAll3?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeAll3?.startedTimestamp!,
            beforeEach11?.startedTimestamp!
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
            beforeAll3?.finishedTimestamp!,
            beforeEach11?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeAll3?.finishedTimestamp!,
            beforeEach11?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach11?.startedTimestamp!,
            beforeEach12?.startedTimestamp!
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
            beforeEach11?.finishedTimestamp!,
            beforeEach12?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach11?.finishedTimestamp!,
            beforeEach12?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach12?.startedTimestamp!,
            beforeEach13?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeEach3",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeEach12?.finishedTimestamp!,
            beforeEach13?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach12?.finishedTimestamp!,
            beforeEach13?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach13?.startedTimestamp!,
            test1?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "test",
          id: expect.anything(),
          title: javaTestName + "#test1",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeEach11?.finishedTimestamp!,
            test1?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach11?.finishedTimestamp!,
            test1?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            test1?.startedTimestamp!,
            afterEach11?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach1",
          createdTimestamp: expect.betweenDatesOrEqual(
            test1?.finishedTimestamp!,
            afterEach11?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            test1?.finishedTimestamp!,
            afterEach11?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach11?.startedTimestamp!,
            afterEach12?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach2",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterEach11?.finishedTimestamp!,
            afterEach12?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach11?.finishedTimestamp!,
            afterEach12?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach12?.startedTimestamp!,
            afterEach13?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach3",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterEach12?.finishedTimestamp!,
            afterEach13?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach12?.finishedTimestamp!,
            afterEach13?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach13?.startedTimestamp!,
            beforeEach21?.startedTimestamp!
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
            afterEach13?.finishedTimestamp!,
            beforeEach21?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach13?.finishedTimestamp!,
            beforeEach21?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach21?.startedTimestamp!,
            beforeEach22?.startedTimestamp!
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
            beforeEach21?.finishedTimestamp!,
            beforeEach22?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach21?.finishedTimestamp!,
            beforeEach22?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach22?.startedTimestamp!,
            beforeEach23?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeEach3",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeEach22?.finishedTimestamp!,
            beforeEach23?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach22?.finishedTimestamp!,
            beforeEach23?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach23?.startedTimestamp!,
            test3?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "test",
          id: expect.anything(),
          title: javaTestName + "#test2",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeEach23?.finishedTimestamp!,
            test2?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach23?.finishedTimestamp!,
            test2?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            test2?.startedTimestamp!,
            afterEach21?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach1",
          createdTimestamp: expect.betweenDatesOrEqual(
            test2?.finishedTimestamp!,
            afterEach21?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            test2?.finishedTimestamp!,
            afterEach21?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach21?.startedTimestamp!,
            afterEach22?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach2",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterEach21?.finishedTimestamp!,
            afterEach22?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach21?.finishedTimestamp!,
            afterEach22?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach22?.startedTimestamp!,
            afterEach23?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach3",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterEach22?.finishedTimestamp!,
            afterEach23?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach22?.finishedTimestamp!,
            afterEach23?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach23?.startedTimestamp!,
            beforeEach31?.startedTimestamp!
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
            afterEach23?.finishedTimestamp!,
            beforeEach31?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach23?.finishedTimestamp!,
            beforeEach31?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach31?.startedTimestamp!,
            beforeEach32?.startedTimestamp!
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
            beforeEach31?.finishedTimestamp!,
            beforeEach32?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach31?.finishedTimestamp!,
            beforeEach32?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach32?.startedTimestamp!,
            beforeEach33?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "before test",
          id: expect.anything(),
          title: javaTestName + "#beforeEach3",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeEach32?.finishedTimestamp!,
            beforeEach33?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach32?.finishedTimestamp!,
            beforeEach33?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            beforeEach33?.startedTimestamp!,
            test3?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "test",
          id: expect.anything(),
          title: javaTestName + "#test3",
          createdTimestamp: expect.betweenDatesOrEqual(
            beforeEach31?.finishedTimestamp!,
            test3?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            beforeEach31?.finishedTimestamp!,
            test3?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            test3?.startedTimestamp!,
            afterEach31?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach1",
          createdTimestamp: expect.betweenDatesOrEqual(
            test3?.finishedTimestamp!,
            afterEach31?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            test1?.finishedTimestamp!,
            afterEach31?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach31?.startedTimestamp!,
            afterEach32?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach2",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterEach31?.finishedTimestamp!,
            afterEach32?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach31?.finishedTimestamp!,
            afterEach32?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach32?.startedTimestamp!,
            afterEach33?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterEach3",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterEach32?.finishedTimestamp!,
            afterEach33?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach32?.finishedTimestamp!,
            afterEach33?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterEach33?.startedTimestamp!,
            afterAll1?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },

        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterAll1",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterEach33?.finishedTimestamp!,
            afterAll1?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterEach33?.finishedTimestamp!,
            afterAll1?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterAll1?.startedTimestamp!,
            afterAll2?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterAll2",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterAll1?.finishedTimestamp!,
            afterAll2?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterAll1?.finishedTimestamp!,
            afterAll2?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterAll2?.startedTimestamp!,
            afterAll3?.startedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
        {
          launchId: launch.id,
          parentContextId: context?.id,
          entityType: "after test",
          id: expect.anything(),
          title: javaTestName + "#afterAll3",
          createdTimestamp: expect.betweenDatesOrEqual(
            afterAll2?.finishedTimestamp!,
            afterAll3?.finishedTimestamp!
          ),
          startedTimestamp: expect.betweenDatesOrEqual(
            afterAll2?.finishedTimestamp!,
            afterAll3?.finishedTimestamp!
          ),
          finishedTimestamp: expect.betweenDatesOrEqual(
            afterAll3?.startedTimestamp!,
            context?.finishedTimestamp!
          ),
          statusId: DEFAULT_TEST_STATUSES.SUCCESSFUL.id,
        },
      ],
      pagination: {
        offset: 0,
        limit: 30,
        total: 28,
      },
    });
  });
});
