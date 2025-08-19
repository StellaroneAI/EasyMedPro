import authService from '../authService';

describe('authService', () => {
  it('returns API base URL', () => {
    expect(authService.getApiBaseUrl()).toBe('/api');
  });
});
