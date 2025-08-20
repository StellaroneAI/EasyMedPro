import axios from 'axios';

class MCPClient {
  constructor() {
    this.baseURL = process.env.MCP_GATEWAY_BASE_URL || 'https://mcp.stellarone.health';
    this.apiKey = process.env.MCP_API_KEY;
    this.clientId = process.env.MCP_CLIENT_ID;
    this.clientSecret = process.env.MCP_CLIENT_SECRET;
    this.timeout = 10000; // 10 seconds
    this.maxRetries = 3;
    
    // Initialize axios instance
    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey || 'demo-key'
      }
    });
  }

  async request(service, operation, params) {
    const maxRetries = this.maxRetries;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[MCP] Attempting ${service}/${operation} (attempt ${attempt}/${maxRetries})`);
        
        const response = await this.httpClient.post(`/${service}/${operation}`, {
          ...params,
          clientId: this.clientId,
          timestamp: new Date().toISOString()
        });

        if (response.data && response.status === 200) {
          console.log(`[MCP] ${service}/${operation} succeeded`);
          return response.data;
        }

        throw new Error(`Invalid response: ${response.status}`);

      } catch (error) {
        lastError = error;
        const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
        const isNetworkError = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';
        
        console.log(`[MCP] Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries && (isTimeout || isNetworkError)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[MCP] Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        // Don't retry for auth errors or client errors
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          break;
        }
      }
    }

    // All retries failed
    const errorMessage = lastError?.response?.data?.message || lastError?.message || 'MCP request failed';
    console.error(`[MCP] ${service}/${operation} failed after ${maxRetries} attempts:`, errorMessage);
    throw new Error(`MCP service unavailable: ${errorMessage}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.httpClient.get('/health');
      return response.status === 200;
    } catch (error) {
      console.log('[MCP] Health check failed:', error.message);
      return false;
    }
  }

  // Mask sensitive data in logs
  maskSensitiveData(data) {
    const masked = { ...data };
    
    // Mask common PHI fields
    if (masked.phoneNumber) {
      masked.phoneNumber = this.maskPhoneNumber(masked.phoneNumber);
    }
    if (masked.email) {
      masked.email = this.maskEmail(masked.email);
    }
    if (masked.patientId) {
      masked.patientId = this.maskId(masked.patientId);
    }
    
    return masked;
  }

  maskPhoneNumber(phone) {
    if (!phone || phone.length < 4) return '****';
    return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
  }

  maskEmail(email) {
    if (!email || !email.includes('@')) return '*****@*****.***';
    const [local, domain] = email.split('@');
    return local.slice(0, 2) + '***@' + domain;
  }

  maskId(id) {
    if (!id || id.length < 6) return '****';
    return id.slice(0, 3) + '*'.repeat(id.length - 6) + id.slice(-3);
  }
}

// Export a singleton instance
const mcpClientInstance = new MCPClient();

export function getMCPClient() {
  return mcpClientInstance;
}

export { MCPClient };
