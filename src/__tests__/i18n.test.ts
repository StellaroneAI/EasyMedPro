const mockStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key]),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => { store = {}; })
  } as Storage;
})();

Object.defineProperty(window, 'localStorage', { value: mockStorage });

async function importI18n() {
  const mod = await import('../i18n');
  await new Promise(resolve => setTimeout(resolve, 0));
  return mod;
}

describe('i18n persistence', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.resetModules();
  });

  it('persists language selection across reloads', async () => {
    let i18nModule = await importI18n();
    i18nModule.setLanguage('hi');
    expect(mockStorage.setItem).toHaveBeenCalledWith('lang', 'hi');

    jest.resetModules();
    i18nModule = await importI18n();
    expect(mockStorage.getItem).toHaveBeenCalledWith('lang');
    expect(i18nModule.default.language).toBe('hi');
  });
});
