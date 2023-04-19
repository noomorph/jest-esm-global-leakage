it('should not leak', () => {
    expect(globalThis.__LEAKAGE__).toBeUndefined();
});
