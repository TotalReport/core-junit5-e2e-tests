import { registerMatcher } from "earl";

declare module "earl" {
  interface Matchers {
    /**
     * Check if the value is a string that represents a date that is close to now.
     * @param delta - The maximum difference in milliseconds between the value and now.
     */
    isCloseToNow(delta: number): never;

    /**
     * Check if the value is a date that is close to the provided date.
     *
     * @param date The date to compare to.
     * @param delta The maximum difference in milliseconds between the value and the provided date.
     */
    closeToDate(date: Date, delta: number): never;

    beforeDate(date: Date): never;
    betweenDates(dateMin: Date | string, dateMax: Date | string): never;
  }
}

registerMatcher("isCloseToNow", isCloseToNow);
registerMatcher("closeToDate", closeToDate);
registerMatcher("beforeDate", beforeDate);
registerMatcher("betweenDates", betweenDates);

export function isCloseToNow(delta: number) {
  return (value: unknown): boolean => {
    const nowLocal = new Date();

    if (value instanceof Date) {
      const nowUtc = nowLocal.getTime();

      const valueAsNumber = (<Date>value).getTime();

      return Math.abs(nowUtc - valueAsNumber) <= delta;
    }

    if (typeof value === "string") {
      const nowUtc = nowLocal.getTime();

      const valueAsNumber = new Date(value).getTime();

      return Math.abs(nowUtc - valueAsNumber) <= delta;
    }

    return false;
  };
}

export function closeToDate(date: Date, delta: number) {
  return (value: unknown): boolean => {
    const dateAsMilliseconds = date.getTime();

    if (value instanceof Date) {
      const valueAsMilliseconds = (<Date>value).getTime();

      return Math.abs(dateAsMilliseconds - valueAsMilliseconds) <= delta;
    }

    if (typeof value === "string") {
      const valueAsNumber = new Date(value).getTime();

      return Math.abs(dateAsMilliseconds - valueAsNumber) <= delta;
    }

    return false;
  };
}

export function beforeDate(date: Date) {
  return (value: unknown): boolean => {
    const dateAsMilliseconds = date.getTime();

    if (value instanceof Date) {
      const valueAsMilliseconds = (<Date>value).getTime();

      return dateAsMilliseconds > valueAsMilliseconds;
    }

    if (typeof value === "string") {
      const valueAsNumber = new Date(value).getTime();

      return dateAsMilliseconds > valueAsNumber;
    }

    return false;
  };
}

export function betweenDates(dateMin: Date | string, dateMax: Date | string) {
  return (value: unknown): boolean => {
    const parsedDateMin = parseDate(dateMin);

    if (parsedDateMin === undefined) {
      return false;
    }

    const parsedDateMax = parseDate(dateMax);

    if (parsedDateMax === undefined) {
      return false;
    }
    
    const parsedValue = parseDate(value);

    if (parsedValue === undefined) {
      return false;
    }

    const dateMinAsMilliseconds = parsedDateMin.getTime();
    const dateMaxAsMilliseconds = parsedDateMax.getTime();
    const valueAsMilliseconds = parsedValue.getTime();

    return (
      dateMinAsMilliseconds < valueAsMilliseconds &&
      valueAsMilliseconds < dateMaxAsMilliseconds
    );
  };
}

function parseDate(value: unknown) {
  if (value instanceof Date) {
    return <Date>value;
  }
  if (typeof value === "string") {
    return new Date(value);
  }
  return undefined;
}
