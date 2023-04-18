import './shared-module.js';

test('__COUNTER__ should equal 1', () => {
    expect(globalThis.__COUNTER__).toBe(1);
});
