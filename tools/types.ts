import { initClient, InitClientArgs } from "@ts-rest/core";
import { contract } from "@total-report/core-contract/contract";

/**
 * The REST API client type.
 */
export type ClientType = ReturnType<
  typeof initClient<typeof contract, InitClientArgs>
>;
