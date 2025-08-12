# Twilio SMS Authentication Testing Guide

## Testing Scenarios

### 1. Phone Number Validation Testing

#### Test Cases:
1. **Valid Indian Numbers**
   - `9876543210` ✅ Should accept
   - `8123456789` ✅ Should accept  
   - `7987654321` ✅ Should accept
   - `6123456789` ✅ Should accept

2. **Invalid Numbers**
   - `1234567890` ❌ Should reject (doesn't start with 6-9)
   - `5876543210` ❌ Should reject (starts with 5)
   - `987654321` ❌ Should reject (9 digits)
   - `98765432100` ❌ Should reject (11 digits)
   - `abcd123456` ❌ Should reject (contains letters)

3. **Format Flexibility**
   - `+919876543210` ✅ Should accept and format
   - `919876543210` ✅ Should accept and format
   - `+91 9876543210` ✅ Should accept and format
   - `91-9876543210` ✅ Should accept and format

### 2. OTP Flow Testing

#### Scenario A: Successful OTP Flow
1. Enter valid phone number: `9876543210`
2. Click "Send OTP"
3. Verify SMS received with 6-digit code
4. Enter correct OTP
5. Click "Verify OTP"
6. Should login successfully

#### Scenario B: OTP Expiry Testing
1. Send OTP to phone number
2. Wait 11 minutes (beyond 10-minute expiry)
3. Try to verify with correct OTP
4. Should show "OTP expired" error

#### Scenario C: Invalid OTP Testing
1. Send OTP to phone number
2. Enter incorrect 6-digit code
3. Should show "Invalid OTP" with remaining attempts
4. Try 3 times with wrong OTP
5. Should block further attempts

#### Scenario D: Rate Limiting Testing
1. Send 5 OTP requests quickly
2. Try 6th request
3. Should show "Too many requests" error
4. Wait 15 minutes
5. Should allow new OTP request

### 3. Multi-language Testing

#### Test each language:
1. Set language to Hindi
2. Send OTP
3. Verify SMS is in Hindi
4. Repeat for all supported languages

#### Expected SMS formats:
- **English**: "Your EasyMed verification code is: 123456..."
- **Hindi**: "आपका EasyMed सत्यापन कोड है: 123456..."

### 4. User Type Testing

#### Test all user types:
1. **Patient Login**
   - Phone: `9876543210`
   - User Type: Patient
   - Should create patient profile

2. **ASHA Worker Login**
   - Phone: `8123456789`
   - User Type: ASHA
   - Should create ASHA profile

3. **Doctor Login**
   - Phone: `7987654321`
   - User Type: Doctor
   - Should create doctor profile

4. **Admin Login**
   - Phone: `6123456789`
   - User Type: Admin
   - Should create admin profile

### 5. Session Management Testing

#### Test JWT token functionality:
1. Login successfully
2. Check localStorage for tokens
3. Refresh page - should stay logged in
4. Wait 16 minutes (token expiry)
5. Make authenticated request
6. Should auto-refresh token
7. Logout - should clear all tokens

### 6. Error Handling Testing

#### Network Error Testing:
1. Disconnect internet
2. Try to send OTP
3. Should show network error message
4. Reconnect internet
5. Should work normally

#### Twilio Service Error Testing:
1. Use invalid Twilio credentials
2. Try to send OTP
3. Should show service error
4. Should not crash application

### 7. Security Testing

#### Brute Force Protection:
1. Try to send multiple OTPs rapidly
2. Should be rate limited
3. Try wrong OTP multiple times
4. Should block after 3 attempts

#### Token Security:
1. Check that OTP is hashed in storage
2. Verify JWT tokens are properly signed
3. Test token expiry mechanisms

### 8. Mobile Device Testing

#### Test on different devices:
1. **iOS Safari**
   - Phone input should work
   - SMS should be received
   - Auto-fill OTP if available

2. **Android Chrome**
   - Phone input should work
   - SMS should be received
   - Web OTP API integration

3. **Mobile browsers**
   - Responsive design
   - Touch-friendly inputs
   - Proper keyboard types

### 9. Production Environment Testing

#### Before going live:
1. Test with real Twilio account
2. Verify SMS delivery to India
3. Test rate limiting in production
4. Monitor costs and usage
5. Test error handling with real errors

### 10. Performance Testing

#### Load Testing:
1. Simulate 100 concurrent OTP requests
2. Measure response times
3. Check error rates
4. Monitor Twilio usage

#### Memory Testing:
1. Send many OTPs without verification
2. Check memory usage in browser
3. Verify OTP cleanup after expiry

## Testing Tools

### Manual Testing:
- Use multiple phone numbers
- Test in different browsers
- Use developer tools for debugging

### Automated Testing:
```javascript
// Example test case
describe('Phone Validation', () => {
  test('should accept valid Indian number', () => {
    const result = twilioService.validatePhoneNumber('9876543210');
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('+919876543210');
  });
  
  test('should reject invalid number', () => {
    const result = twilioService.validatePhoneNumber('1234567890');
    expect(result.isValid).toBe(false);
  });
});
```

## Test Data

### Valid Test Phone Numbers (for demo):
- Patient: `9876543210`
- ASHA: `8123456789`
- Doctor: `7987654321`
- Admin: `6123456789`

### Invalid Test Numbers:
- `1234567890` (doesn't start with 6-9)
- `987654321` (too short)
- `98765432100` (too long)

## Expected Results

### Success Metrics:
- OTP delivery rate > 95%
- Authentication success rate > 90%
- Response time < 5 seconds
- Error rate < 5%

### Performance Targets:
- OTP send time < 3 seconds
- Verification time < 2 seconds
- Page load time < 3 seconds
- Mobile responsiveness 100%

## Debugging Tips

### Common Issues:
1. **SMS not received**
   - Check Twilio console logs
   - Verify phone number format
   - Check account balance

2. **Invalid OTP errors**
   - Check OTP expiry time
   - Verify OTP generation logic
   - Check for typos

3. **Rate limiting triggered**
   - Wait for cooldown period
   - Check rate limit configuration
   - Monitor usage patterns

### Browser Console Messages:
- Look for authentication logs
- Check for JavaScript errors
- Monitor network requests

### Twilio Console:
- Check SMS delivery status
- Monitor usage and costs
- Review error logs

## Security Checklist

- [ ] OTP is hashed in storage
- [ ] JWT tokens have proper expiry
- [ ] Rate limiting is enforced
- [ ] Phone numbers are validated
- [ ] Error messages don't leak sensitive data
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Input sanitization is implemented

## Sign-off Criteria

Before deployment:
- [ ] All test scenarios pass
- [ ] Performance targets met
- [ ] Security checklist completed
- [ ] Multi-language support verified
- [ ] Mobile compatibility confirmed
- [ ] Production environment tested
- [ ] Documentation complete
- [ ] Monitoring setup