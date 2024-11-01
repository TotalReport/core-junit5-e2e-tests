/**
 * Error thrown when the server response is not as expected.
 */
export class UnexpectedResponseError extends Error {
  readonly activity: string;
  readonly status: number | undefined;
  readonly body: unknown;

  constructor(activity: string, status: number, body: unknown) {
    const bodyFormatted = body instanceof Object ? JSON.stringify(body) : body;

    super(
      `While "${activity}" received unexpected response status ${status} and body ${bodyFormatted}`
    );
    
    this.activity = activity;
    this.status = status;
    this.body = body;
    this.name = "UnexpectedResponseError";
  }
}
