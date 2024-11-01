# Total Report JUnit5 integration end to end tests
This repository provides end to end tests for [Total Report JUnit5 integration](https://github.com/TotalReport/core-junit5-integration). It uses [Total Report JUnit5 examples](https://github.com/TotalReport/core-junit5-example) to run and check results.

## Requirements
1. [PNPm](https://pnpm.io/) is installed.
2. [Gradle](https://gradle.org/) is installed.
3. [Total Report JUnit5 examples](https://github.com/TotalReport/core-junit5-example) is copied to local directory.

## Installation

1. Run `pnpm install` in the root of the project.
2. Create file `.env.dev` in the root of the project with the next content:
```environment
CORE_SERVICE_ENDPOINT=http://localhost:3030
JUNIT5_TESTS_ROOT=$./total-report-junit5-example
```

Where

* `CORE_SERVICE_ENDPOINT` the URL of the backend instance of [Total Report core service](https://github.com/TotalReport/core)
* `JUNIT5_TESTS_ROOT` the local copy of the [Total Report JUnit5 examples](https://github.com/TotalReport/core-junit5-example) project on the machine.

## Usage
1. `pnpm dotenv -e .env.dev -- pnpm run test`