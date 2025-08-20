import { sendOtp, verifyOtp } from '../utils/otp';

describe('OTP flow', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('sends and verifies OTP successfully', async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ sent: true }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ verified: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const sendResponse = await sendOtp('1234567890');
    const verifyResponse = await verifyOtp('1234567890', '1234');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/sms/send-otp',
      expect.objectContaining({ method: 'POST' })
    );
    expect(sendResponse).toEqual({ sent: true });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/sms/verify-otp',
      expect.objectContaining({ method: 'POST' })
    );
    expect(verifyResponse).toEqual({ verified: true });
  });
});
