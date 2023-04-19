# Jest Global Leakage Bug

This repository demonstrates the leakage of global variables coming from the unsandboxed `globalThis` into the sandboxed one, held by the test environment.

## Description

To reproduce this issue, we need:

* a custom environment class, e.g. `custom-environment.js`:
    ```js title="custom-environment.js"
    globalThis.__LEAKAGE__ = true;
    module.exports = require('jest-environment-node');
    ```
* and a test file, e.g. `leakage.test.js`:
    ```js title="leakage.test.js"
    it('should not leak', () => {
        expect(globalThis.__LEAKAGE__).toBeUndefined();
    });
    ```

For better or for worse, but such test would fail :red_circle:, due to [this commit to Jest 28.x](https://github.com/facebook/jest/commit/5247e1ff6bb13a88f95597979d938fd74c33b655).

However, if you swap the lines, it will pass:

```js
module.exports = require('jest-environment-node');
globalThis.__LEAKAGE__ = true;
```

## Question

Is this the intended behavior? Or global variables introduced via `testEnvironment` module (or its dependencies) should not be copied to the sandboxed `this.global`?

## Steps to reproduce

1. Clone this repository.
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Run the test with the initial import order (the test should fail):
    ```bash
    npm test
    ```

## Confirmed versions

* Jest version: 28.0.0 - 29.5.0
* Node version: 14.x - 18.x

## License

This project is licensed under the **MIT License**.
