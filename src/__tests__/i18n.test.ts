async function importI18n() {
  const mod = await import('../i18n');
  await new Promise(resolve => setTimeout(resolve, 0));
  return mod;
}

describe('i18n language switching', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('updates active language through setLanguage', async () => {
    const i18nModule = await importI18n();
    await i18nModule.setLanguage('hi');
    expect(i18nModule.default.language).toBe('hi');
  });
});
