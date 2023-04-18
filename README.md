# Jest ESM Global Leakage Bug

This repository demonstrates a bug in Jest related to ESM modules and the leakage of unsandboxed `globalThis`.

## Description

Imagine a situation where there is a shared module imported both by a custom environment class and a test file:

```js title="custom-environment.js"
import { TestEnvironment } from 'jest-environment-node';
import './shared-module.js';
export default TestEnvironment;
```

For the sake of demonstration, we'll assert that a global counter will be incremented only once:

```js title="counter.test.js"
import './shared-module.js';

test('__COUNTER__ should equal 1', () => {
    expect(globalThis.__COUNTER__).toBe(1);
});
```

The shared module will be the one who increments that counter as shown below:

```js title="shared-module.js"
globalThis.__COUNTER__ = (globalThis.__COUNTER__ || 0) + 1;
```

Since the test environment class and the test file receive different instances of `globalThis` – the test file works inside a sandboxed `globalThis`, while the environment has an access to an unsandboxed `globalThis` – this test is totally valid and normally it passes:

```plain text
PASS  ./counter.test.js
  ✓ __COUNTER__ should equal 1 (2 ms)
```


However, let's see what happens if we reverse `import` order as shown here:

```js title="custom-environment.js"
import './shared-module.js';
import { TestEnvironment } from 'jest-environment-node';
export default TestEnvironment;
```

The test begins to fail:

```plain text
FAIL  ./counter.test.js
  ✕ __COUNTER__ should equal 1 (3 ms)

  ● __COUNTER__ should equal 1

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 2

      2 |
      3 | test('__COUNTER__ should equal 1', () => {
    > 4 |     expect(globalThis.__COUNTER__).toBe(1);
        |                                    ^
      5 | });
      6 |

      at Object.toBe (counter.test.js:4:36)
```

Therefore, I conclude there is a leakage of an unsandboxed `globalThis` into the context of test under certain conditions, and it hinders my job duties.

## Steps to reproduce

1. Clone this repository.
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Run the test with the initial import order (the test should pass):
    ```bash
    npm test
    ```
4. Change the import order in `test-environment.js` by swapping the lines:
    ```diff
    -import { TestEnvironment } from 'jest-environment-node';
     import './shared-module.js';
    +import { TestEnvironment } from 'jest-environment-node';
     export default TestEnvironment;
    ```
5. Run the test again with the modified import order (the test should fail):
    ```bash
    npm test

    # FAIL  ./counter.test.js
    #  ✕ __COUNTER__ should equal 1 (3 ms)
    #
    #  ● __COUNTER__ should equal 1
    #
    #    expect(received).toBe(expected) // Object.is equality
    #
    #    Expected: 1
    #    Received: 2
    #
    #      2 |
    #      3 | test('__COUNTER__ should equal 1', () => {
    #    > 4 |     expect(globalThis.__COUNTER__).toBe(1);
    #        |                                    ^
    #      5 | });
    #      6 |
    #
    #      at Object.toBe (counter.test.js:4:36)
    ```

## Confirmed versions

* Jest version: 28.0.0 - 29.5.0
* Node version: 14.x - 18.x

## License

This project is licensed under the **MIT License**.
