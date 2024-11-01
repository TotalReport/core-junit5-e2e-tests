import { contract } from "@total-report/core-contract/contract";
import { ClientInferResponseBody } from "@ts-rest/core";
import { ClientType } from "../types.js";
import { UnexpectedResponseError } from "./errors.js";

export class TestEntities {
  client: ClientType;
  constructor(client: ClientType) {
    this.client = client;
  }

  async find(
    filter: TesEntitiesFilter,
    pagination: { offset: number; limit: number }
  ): Promise<FindTestEntitiesResponse> {
    const response = await this.client.findTestEntities({
      query: {
        launchId: filter.launchId,
        parentContextId: filter.parentContextId,
        offset: pagination.offset,
        limit: pagination.limit,
      },
    });

    if (response.status !== 200) {
      throw new UnexpectedResponseError(
        "finding test entities",
        response.status,
        response.body
      );
    }

    return response.body;
  }
}

export type TesEntitiesFilter = {
  launchId?: number | undefined;
  parentContextId?: number | undefined;
};

export type FindTestEntitiesResponse = ClientInferResponseBody<
  typeof contract.findTestEntities,
  200
>;
