import { TestEntities } from "./test-entities.js";
import { ClientType } from "../types.js";

export class CoreClient {
    readonly entities: TestEntities;
    private client: ClientType;

    constructor(client: ClientType) {
        this.client = client;
        this.entities = new TestEntities(client);
    }
}
