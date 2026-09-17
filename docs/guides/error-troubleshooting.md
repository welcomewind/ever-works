---
id: error-troubleshooting
title: Error Troubleshooting & Debugging
sidebar_label: Troubleshooting & Debugging
sidebar_position: 17
---

# Error Troubleshooting & Debugging

This guide helps you diagnose and resolve errors in Ever Works when standard error messages aren't providing enough information.

## Diagnostic Checklist

### Before You Debug

- [ ] Check the HTTP status code first (400, 401, 402, etc.)
- [ ] Read the error message and check the [API Error Reference](/docs/guides/api-error-reference.md)
- [ ] Verify you're using the latest version of the client library
- [ ] Check if there's a known issue in [Status Page](https://status.example.com)
- [ ] Try the same request again (may be transient)
- [ ] Check your network connection

### Environment Checks

- [ ] API endpoint URL is correct
- [ ] Authentication token is valid and not expired
- [ ] Request headers are properly formatted
- [ ] CORS is configured correctly (for browser requests)
- [ ] Firewall/proxy isn't blocking the request
- [ ] Environment variables are correctly set

---

## Common Issues & Solutions

### 401 Unauthorized - "Invalid Token"

#### Symptom
```
statusCode: 401,
message: "Unauthorized",
error: "Unauthorized"
```

#### Causes to Check
1. **Missing Authorization header**
   ```javascript
   // ❌ Missing header
   fetch('/api/works');
   
   // ✅ Correct
   fetch('/api/works', {
     headers: {
       'Authorization': '******'
     }
   });
   ```

2. **Expired token**
   - Tokens typically expire after 24 hours
   - Token was revoked or logged out
   - Clock skew between client and server

3. **Wrong token format**
   - Should be: `******
   - Not: `eyJhbGc...` (missing ******
   - Not: `Token eyJhbGc...` (wrong prefix)

4. **Token from wrong service**
   - Using OAuth token instead of API JWT
   - Token from different environment (staging vs production)
   - Using expired refresh token

#### Debugging Steps
```typescript
// Step 1: Verify token exists
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token length:', token?.length);

// Step 2: Decode token to see claims
function decodeToken(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('Invalid token format');
    return null;
  }
  
  const payload = JSON.parse(
    atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
  );
  
  console.log('Token payload:', payload);
  console.log('Expires at:', new Date(payload.exp * 1000));
  console.log('Is expired:', Date.now() > payload.exp * 1000);
  
  return payload;
}

// Step 3: Test with curl
// curl -H "Authorization: ******" https://api.example.com/api/account/me

// Step 4: Check browser Network tab
// Look at Request Headers → Authorization
// Verify it's exactly: ******
```

#### Solutions
1. **Refresh the token**
   - Use the refresh endpoint to get a new token
   - Store it properly in localStorage/cookies

2. **Re-authenticate**
   - Clear stored token
   - Log in again
   - Get fresh token

3. **Check token expiration**
   - Implement automatic token refresh
   - Set up token refresh interceptor in your HTTP client

---

### 402 Payment Required - "Insufficient Credits"

#### Symptom
```json
{
  "statusCode": 402,
  "error": "InsufficientCredits",
  "message": "Insufficient AI credits for this operation"
}
```

#### Root Cause Analysis
```typescript
// Check your current balance
async function checkBalance() {
  const response = await fetch('/api/credits/balance', {
    headers: { 'Authorization': '******' }
  });
  const data = await response.json();
  console.log('Current balance:', data.balance);
  console.log('Credits available:', data.available);
  console.log('Usage this month:', data.monthlyUsage);
  console.log('Limit this month:', data.monthlyLimit);
}

// Estimate cost of operation
async function estimateCost(operation: string) {
  const response = await fetch(`/api/works/estimate-cost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation })
  });
  const data = await response.json();
  console.log('Estimated cost:', data.creditsCost);
}
```

#### Solutions
1. **Add credits**
   - Go to **Settings → Billing → Add Credits**
   - Complete payment
   - Credits appear instantly (usually)

2. **Check for budget limits**
   - Go to **Settings → Budgets**
   - See if monthly budget is exceeded
   - Increase budget or wait for reset

3. **Optimize usage**
   - Batch operations together
   - Use cheaper models if available
   - Cache results when possible

#### Prevention
```typescript
// Implement pre-flight credit check
async function checkCreditsBeforeOperation(
  estimatedCost: number
): Promise<boolean> {
  const response = await fetch('/api/credits/balance');
  const data = await response.json();
  
  if (data.available < estimatedCost) {
    console.warn('Insufficient credits');
    console.log(`Need: ${estimatedCost}, Have: ${data.available}`);
    return false;
  }
  
  return true;
}
```

---

### 409 Conflict - "No Provider Configured"

#### Symptom
```json
{
  "statusCode": 409,
  "message": "No AI provider configured",
  "error": "Conflict"
}
```

#### Diagnosis
```typescript
// Check which providers are configured
async function checkProviders() {
  const response = await fetch('/api/plugins/capabilities');
  const data = await response.json();
  
  console.log('AI providers:', data.aiProviders);
  console.log('Git providers:', data.gitProviders);
  console.log('Deploy providers:', data.deployProviders);
  console.log('Search providers:', data.searchProviders);
  
  // Check if any are enabled
  if (!data.aiProviders?.length) {
    console.error('No AI providers configured!');
  }
}

// Test provider connection
async function testProvider(providerId: string) {
  const response = await fetch(`/api/plugins/${providerId}/test`, {
    method: 'POST'
  });
  const data = await response.json();
  
  if (!data.success) {
    console.error('Provider test failed:', data.error);
  }
}
```

#### Solutions
1. **Enable AI Provider**
   - Go to **Plugins → AI Providers**
   - Enable OpenAI or another provider
   - Add API key/credentials
   - Click "Test Connection"

2. **Common provider setup**
   
   **OpenAI**:
   - Get API key from https://platform.openai.com/api-keys
   - Paste in Plugin Settings
   - Ensure key has balance

   **Anthropic**:
   - Get API key from https://console.anthropic.com
   - Paste in Plugin Settings
   - Verify billing is set up

   **GitHub (Git Provider)**:
   - Click "Connect" button
   - Authorize in popup
   - Grant repository access
   - Allow webhook setup

   **Vercel (Deploy Provider)**:
   - Get token from https://vercel.com/account/tokens
   - Paste in Plugin Settings
   - Select default team/project

3. **Troubleshoot failed connection**
   ```
   - Check if credentials are correct
   - Verify key isn't expired or revoked
   - Test key in provider's native tool
   - Check for whitespace in credentials
   - Try re-entering the key
   ```

---

### 429 Too Many Requests - "Rate Limited"

#### Symptom
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

#### Analysis
```typescript
// Monitor rate limit headers
function logRateLimitInfo(response: Response) {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  console.log('Rate Limit Info:');
  console.log(`  Limit: ${limit} requests`);
  console.log(`  Remaining: ${remaining}`);
  console.log(`  Resets at: ${new Date(parseInt(reset) * 1000)}`);
  
  if (parseInt(remaining) < 10) {
    console.warn('⚠️ Approaching rate limit!');
  }
}

// Test your request rate
async function measureRequestRate() {
  const times: number[] = [];
  
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    await fetch('/api/works');
    times.push(Date.now() - start);
  }
  
  const avg = times.reduce((a, b) => a + b) / times.length;
  const rps = 1000 / avg; // requests per second
  
  console.log(`Average request: ${avg}ms`);
  console.log(`Rate: ${rps.toFixed(1)} req/sec`);
  console.log(`Hitting 50 req/sec limit in: ${50 / rps} seconds`);
}
```

#### Solutions
1. **Implement exponential backoff**
   ```typescript
   async function apiCall(url: string, options?: RequestInit, retries = 5) {
     let delay = 1000; // 1 second
     
     for (let i = 0; i < retries; i++) {
       const response = await fetch(url, options);
       
       if (response.status === 429) {
         if (i < retries - 1) {
           console.log(`Rate limited. Waiting ${delay}ms...`);
           await new Promise(r => setTimeout(r, delay));
           delay *= 2; // exponential backoff
           continue;
         }
       }
       
       return response;
     }
     
     throw new Error('Max retries exceeded');
   }
   ```

2. **Batch operations**
   ```typescript
   // ❌ 10 requests (bad)
   for (let i = 0; i < 10; i++) {
     await fetch(`/api/works/${i}`);
   }
   
   // ✅ 1 batched request
   await fetch('/api/works/batch', {
     method: 'POST',
     body: JSON.stringify({
       ids: Array.from({length: 10}, (_, i) => i)
     })
   });
   ```

3. **Spread requests over time**
   ```typescript
   // Queue requests with delays
   async function queuedRequest(url: string, delayMs: number) {
     await new Promise(r => setTimeout(r, delayMs));
     return fetch(url);
   }
   
   // Make requests over 10 seconds instead of all at once
   const requests = [];
   for (let i = 0; i < 100; i++) {
     requests.push(queuedRequest(url, i * 100));
   }
   await Promise.all(requests);
   ```

---

### 500 Internal Server Error

#### Symptom
```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Internal server error"
}
```

#### Diagnosis
```typescript
// Collect error details
async function diagnoseServerError(url: string) {
  try {
    const response = await fetch(url);
    
    if (response.status === 500) {
      // Collect diagnostic info
      const info = {
        timestamp: new Date().toISOString(),
        url: response.url,
        status: response.status,
        method: response.ok ? 'GET' : 'unknown',
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text()
      };
      
      console.error('Server Error Details:', info);
      
      // Try same request again
      console.log('Retrying...');
      const retry = await fetch(url);
      if (retry.ok) {
        console.log('✓ Retry succeeded - likely transient issue');
      } else {
        console.error('✗ Retry failed - likely persistent issue');
      }
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

#### Root Causes to Check
1. **Database error**
   - Check if database is running
   - Check database connection string
   - Look for database error logs

2. **External service error**
   - Check if AI provider is responding
   - Check Git provider connectivity
   - Test external API keys

3. **Application error**
   - Check application logs
   - Look for stack traces
   - Check recent deployments

#### Solutions
1. **Immediate action**
   - Retry after a few seconds
   - Check status page for incidents
   - If self-hosting, check server logs

2. **Enable debug logging** (self-hosted)
   ```bash
   # Set debug flag
   DEBUG=true npm run dev:api
   
   # Check logs
   tail -f logs/api.log | grep "error"
   ```

3. **Check Sentry** (if configured)
   - Visit Sentry dashboard
   - Search for recent errors
   - Check error frequency
   - View related events

---

## Debugging Tools & Techniques

### Browser DevTools

#### Network Tab
```
Right-click Request → Copy as cURL

Paste in terminal and run to replicate request:
curl -X POST https://api.example.com/works \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

#### Application Tab
```
Check stored values:
- localStorage.getItem('token')
- sessionStorage
- Cookies (look for auth token)
```

#### Console
```
// Log API calls
fetch('/api/works')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', r.headers);
    return r.json();
  })
  .then(data => console.log('Body:', data))
  .catch(e => console.error('Error:', e));
```

### cURL Testing

```bash
# Basic test
curl https://api.example.com/api/works

# With authentication
curl -H "Authorization: ******" \
  https://api.example.com/api/works

# With debug info
curl -v https://api.example.com/api/works \
  2>&1 | head -20

# POST request
curl -X POST https://api.example.com/api/works \
  -H "Content-Type: application/json" \
  -H "Authorization: ******" \
  -d '{"title":"Test Work"}'

# Show response headers
curl -i https://api.example.com/api/works

# Measure response time
curl -w "Time: %{time_total}s\n" \
  https://api.example.com/api/works
```

### Postman Collection

Import the Ever Works API collection:
1. Go to **Postman**
2. Import from API docs
3. Set environment variables (token, base URL)
4. Run requests and debug responses
5. Check response body for error details

### Server-Side Logging

#### View Logs (Docker)
```bash
# Recent logs
docker-compose logs api --tail=100

# Follow logs in real-time
docker-compose logs -f api

# Filter for errors
docker-compose logs api | grep -i error
```

#### View Logs (Kubernetes)
```bash
# Recent logs
kubectl logs -f deployment/ever-works-api

# Previous pod logs
kubectl logs pod-name --previous

# Filter for errors
kubectl logs deployment/ever-works-api | grep "error"
```

#### Enable Verbose Logging
```bash
# Set log level
LOG_LEVEL=debug npm run dev:api

# Include stack traces
SHOW_STACK_TRACE=true npm run dev:api
```

---

## Testing Your Fix

### Test Checklist
- [ ] Same request now returns 2xx status
- [ ] Response body contains expected data
- [ ] No related errors appear
- [ ] Rate limiting is respected
- [ ] Authentication tokens are valid
- [ ] Database changes persisted correctly
- [ ] External integrations still working

### Verification Steps
```typescript
async function verifyFix() {
  try {
    // Test 1: Authentication works
    const authResponse = await fetch('/api/account/me', {
      headers: { 'Authorization': '******' }
    });
    console.log('✓ Auth test passed:', authResponse.ok);

    // Test 2: Can create resource
    const createResponse = await fetch('/api/works', {
      method: 'POST',
      headers: { 
        'Authorization': '******',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Test' })
    });
    console.log('✓ Create test passed:', createResponse.ok);

    // Test 3: Can read resource
    const readResponse = await fetch('/api/works', {
      headers: { 'Authorization': '******' }
    });
    console.log('✓ Read test passed:', readResponse.ok);

    // Test 4: No rate limiting
    let rateLimited = false;
    for (let i = 0; i < 10; i++) {
      const response = await fetch('/api/works');
      if (response.status === 429) {
        rateLimited = true;
        break;
      }
    }
    console.log('✓ Rate limit test passed:', !rateLimited);

  } catch (error) {
    console.error('Verification failed:', error);
  }
}
```

---

## Getting Help

### Before Contacting Support

- [ ] Tried steps in this guide
- [ ] Checked [Status Page](https://status.example.com)
- [ ] Verified credentials and configuration
- [ ] Retried the operation
- [ ] Collected error details and logs

### Information to Provide

When contacting support, include:

```
1. Error details:
   - HTTP status code
   - Error message
   - API endpoint
   - Request payload (without secrets)

2. Environment:
   - Ever Works version
   - Browser/client version
   - Operating system
   - Self-hosted or SaaS?

3. Steps to reproduce:
   - Exact sequence of actions
   - Related requests before error
   - How often it occurs

4. Logs:
   - Full error response
   - Browser console errors
   - Server logs (if available)
   - Request/response headers
```

### Support Channels

- **Documentation**: Check [Guides](/docs/guides) and [API Reference](/docs/api)
- **Discussions**: GitHub Discussions for community help
- **Email Support**: support@example.com
- **Status Page**: https://status.example.com

---

## See Also

- [API Error Reference](/docs/guides/api-error-reference.md)
- [Error Handling Guide](/docs/guides/error-handling-guide.md)
- [API Error Handling Details](/docs/api/error-handling.md)
- [Rate Limiting](/docs/advanced/rate-limiting.md)
