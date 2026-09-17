---
id: api-error-reference
title: API Error Reference
sidebar_label: API Error Reference
sidebar_position: 9
---

# API Error Reference

A quick lookup reference for all HTTP status codes and error scenarios in the Ever Works API.

## Status Code Reference

### 2xx Success

#### 200 OK
- **Meaning**: Request succeeded
- **Action**: No action needed, process the response

#### 201 Created
- **Meaning**: Resource was successfully created
- **Example**: POST /api/works returns 201 when work is created

#### 204 No Content
- **Meaning**: Request succeeded but there's no content to return
- **Example**: DELETE endpoints often return 204

---

### 4xx Client Errors

#### 400 Bad Request
- **Meaning**: Invalid request format or validation failed
- **Causes**:
  - Missing required fields
  - Wrong data type (string vs number)
  - Invalid format (URL, email, UUID)
  - Values outside allowed range
  - Unknown fields in request

- **How to Fix**:
  1. Check the error message for the specific validation issue
  2. Review the API endpoint documentation
  3. Ensure all required fields are provided
  4. Verify data types match expectations
  5. Check numeric ranges and enums

- **Example**:
  ```bash
  curl -X POST https://api.example.com/works \
    -H "Content-Type: application/json" \
    -d '{"title": 123}'  # ❌ title must be string
  ```

  Response:
  ```json
  {
    "statusCode": 400,
    "message": ["title must be a string"],
    "error": "Bad Request"
  }
  ```

---

#### 401 Unauthorized
- **Meaning**: Authentication failed or token missing/invalid
- **Causes**:
  - Missing Authorization header
  - Invalid or expired JWT token
  - Malformed token
  - Wrong authentication method

- **How to Fix**:
  1. Include Authorization header: `Authorization: ******
  2. Verify the token is valid and not expired
  3. Request a new token if expired
  4. Check token format (should start with "Bearer ")
  5. Ensure you're not mixing API keys with JWT

- **Example**:
  ```bash
  # ❌ Missing Authorization header
  curl https://api.example.com/works

  # ✅ Correct
  curl https://api.example.com/works \
    -H "Authorization: ******"
  ```

- **See Also**: [Authentication Guide](/docs/api/authentication.md)

---

#### 402 Payment Required
- **Meaning**: Insufficient credits or budget exceeded
- **Causes**:
  - AI credits exhausted
  - Monthly work budget cap reached
  - Account balance is zero
  - Operation would exceed configured limits

- **How to Fix**:
  1. Check credit balance at **Settings → Billing → Credits**
  2. Add more credits to your account
  3. Or increase monthly budget limits
  4. Review resource usage in the dashboard

- **Example Response**:
  ```json
  {
    "statusCode": 402,
    "error": "InsufficientCredits",
    "message": "Insufficient AI credits for this operation"
  }
  ```

- **Related Endpoints**:
  - `GET /api/credits/balance` - Check current balance
  - `POST /api/credits/add` - Add credits
  - `GET /api/budgets` - View budget settings

- **See Also**: [Billing & Credits](/docs/features/credits-and-billing.md)

---

#### 403 Forbidden
- **Meaning**: You don't have permission to access this resource
- **Causes**:
  - Insufficient role/permissions
  - Organization/workspace access denied
  - Resource is private
  - Rate limiting threshold exceeded

- **How to Fix**:
  1. Verify you have the required role
  2. Check if you're in the correct organization/workspace
  3. Ask an admin to grant permissions
  4. Verify the resource isn't restricted

- **Related Operations**:
  - Check user role with `GET /api/account/me`
  - Review organization permissions in settings

- **See Also**: [Organizations & Teams](/docs/features/organizations.md)

---

#### 404 Not Found
- **Meaning**: Resource doesn't exist or couldn't be found
- **Causes**:
  - Invalid resource ID
  - Resource has been deleted
  - Wrong endpoint path
  - Typo in URL
  - Wrong organization/workspace context

- **How to Fix**:
  1. Verify the resource ID is correct
  2. Check that the resource hasn't been deleted
  3. Confirm the endpoint path is correct
  4. List resources to find the correct ID
  5. Verify you're in the right organization/workspace

- **Example**:
  ```bash
  # ❌ Wrong ID
  curl https://api.example.com/works/invalid-id

  # ✅ Get correct ID from list
  curl https://api.example.com/works
  ```

---

#### 409 Conflict
- **Meaning**: Operation conflicts with current state or configuration
- **Causes**:
  - No AI provider configured
  - No Git provider connected
  - No deployment provider configured
  - Missing credentials or API keys
  - Resource already exists
  - State conflict (e.g., cannot delete while processing)

- **How to Fix** (by provider type):
  
  **AI Provider Issue**:
  1. Go to **Plugins → AI Providers**
  2. Enable an AI provider (OpenAI, Anthropic, etc.)
  3. Add API credentials
  4. Test the connection
  5. Retry the operation

  **Git Provider Issue**:
  1. Go to **Plugins → Git Providers**
  2. Connect GitHub account via OAuth
  3. Authorize the integration
  4. Retry the operation

  **Deployment Provider Issue**:
  1. Go to **Plugins → Deployment**
  2. Add Vercel API token or other deployment credentials
  3. Test connection
  4. Retry deployment

- **Example Responses**:
  ```json
  // No AI provider
  {
    "statusCode": 409,
    "message": "No AI provider configured",
    "error": "Conflict"
  }

  // No Git provider
  {
    "statusCode": 409,
    "message": "Git provider not configured",
    "error": "Conflict"
  }
  ```

- **See Also**: [Plugin System](/docs/features/plugins.md)

---

#### 429 Too Many Requests
- **Meaning**: Rate limit exceeded
- **Rate Limits**:
  - **Short term**: 50 requests/second
  - **Medium term**: 300 requests/10 seconds
  - **Long term**: 1000 requests/minute

- **Causes**:
  - Making requests too fast
  - Burst of requests
  - Automated/script requests without throttling
  - Load testing

- **How to Fix**:
  1. **Implement exponential backoff**:
     ```typescript
     // Wait 1s, then 2s, then 4s, etc.
     const delay = Math.pow(2, retryCount) * 1000;
     ```
  
  2. **Batch operations**:
     - Combine multiple creates into a bulk endpoint
     - Use batch operations instead of individual calls

  3. **Spread requests**:
     - Don't send burst of requests
     - Queue requests and send them over time

  4. **Cache responses**:
     - Store results locally
     - Avoid redundant API calls

- **Example - Retry Strategy**:
  ```javascript
  async function fetchWithRetry(url, options, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.status !== 429) return response;
      } catch (error) {}
      
      // Wait before retry
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
    throw new Error('Max retries exceeded');
  }
  ```

- **See Also**: [Rate Limiting Guide](/docs/advanced/rate-limiting.md)

---

### 5xx Server Errors

#### 500 Internal Server Error
- **Meaning**: Unexpected server error
- **Causes**:
  - Database error
  - Uncaught exception
  - External service failure
  - Configuration error
  - Deployment issue

- **What to Do**:
  1. **Retry after waiting** - Usually temporary
  2. **Check status page** - Any known incidents?
  3. **Try again with different parameters** - Maybe your specific input triggered a bug
  4. **Contact support** - If the error persists
  5. **Check logs** - If self-hosting, review application logs

- **Debugging** (if self-hosting):
  ```bash
  # View logs
  docker-compose logs api

  # Enable debug mode
  DEBUG=true npm run dev:api

  # Check error tracking
  # - Sentry dashboard (if configured)
  # - Application logs
  ```

---

#### 502 Bad Gateway
- **Meaning**: Invalid response from upstream service
- **Causes**:
  - Load balancer misconfiguration
  - Upstream service crashed
  - Network connectivity issue
  - Deployment in progress

- **What to Do**:
  1. Wait a few seconds and retry
  2. Check status page for deployment status
  3. Try a different request to see if it's widespread
  4. Contact support if persists

---

#### 503 Service Unavailable
- **Meaning**: Server is temporarily unavailable (maintenance, overload, etc.)
- **Causes**:
  - Scheduled maintenance
  - Server overload
  - Database maintenance
  - Temporary outage

- **What to Do**:
  1. Check status page for maintenance window
  2. Wait and retry after a delay
  3. Implement retry logic with exponential backoff
  4. Contact support if it lasts longer than expected

---

#### 504 Gateway Timeout
- **Meaning**: Request took too long to complete
- **Causes**:
  - Long-running operation
  - Network latency
  - Database query timeout
  - External service timeout

- **What to Do**:
  1. Check if the operation already completed (check resource state)
  2. Try with smaller data set or shorter time range
  3. Implement longer timeout on client side
  4. Contact support if needed

---

## Error Scenarios by Operation

### Creating a Resource (POST)

| Scenario | Status | Solution |
| -------- | ------ | -------- |
| Missing required field | 400 | Add the required field |
| Invalid data type | 400 | Use correct type (string, number, etc.) |
| Not authenticated | 401 | Add Authorization header |
| No credits | 402 | Add credits to account |
| Insufficient permissions | 403 | Ask admin for permissions |
| Resource already exists | 409 | Use existing resource or delete first |
| Too many requests | 429 | Wait and retry |
| Server error | 500 | Retry after waiting |

### Reading a Resource (GET)

| Scenario | Status | Solution |
| -------- | ------ | -------- |
| Not authenticated | 401 | Add Authorization header |
| Insufficient permissions | 403 | Ask admin for permissions |
| Resource doesn't exist | 404 | Verify resource ID |
| Too many requests | 429 | Wait and retry |
| Server error | 500 | Retry after waiting |

### Updating a Resource (PATCH/PUT)

| Scenario | Status | Solution |
| -------- | ------ | -------- |
| Invalid data | 400 | Fix the payload |
| Not authenticated | 401 | Add Authorization header |
| Insufficient permissions | 403 | Ask admin for permissions |
| Resource doesn't exist | 404 | Verify resource ID |
| State conflict | 409 | Check resource state |
| Too many requests | 429 | Wait and retry |
| Server error | 500 | Retry after waiting |

### Deleting a Resource (DELETE)

| Scenario | Status | Solution |
| -------- | ------ | -------- |
| Not authenticated | 401 | Add Authorization header |
| Insufficient permissions | 403 | Ask admin for permissions |
| Resource doesn't exist | 404 | Resource already deleted |
| Can't delete (dependency) | 409 | Delete dependencies first |
| Too many requests | 429 | Wait and retry |
| Server error | 500 | Retry after waiting |

---

## Common Operations and Their Common Errors

### Generating Content

```
400: Title/parameters invalid
401: Not authenticated
402: Insufficient credits
404: Work not found
409: AI provider not configured
500: Generation failed
```

**Solution**: Check parameters, add credits, configure AI provider.

### Deploying to Vercel

```
400: Invalid configuration
401: Not authenticated
402: Insufficient credits
404: Work not found
409: Vercel provider not configured
500: Deployment failed
```

**Solution**: Add Vercel token, check configuration, add credits.

### Getting Git Providers

```
401: Not authenticated
403: No permissions
409: Git provider not configured/connected
500: Failed to fetch
```

**Solution**: Connect GitHub, check permissions, retry.

### Processing Template

```
400: Invalid template format
404: Template not found
409: No providers configured
500: Processing failed
```

**Solution**: Verify template, configure providers, retry.

---

## Error Message Decoding Guide

### "Max rate limit reached"

**Meaning**: You've exceeded the rate limit

**Fix**: Implement exponential backoff, batch operations, or spread requests

---

### "Invalid request body"

**Meaning**: Payload structure is wrong

**Fix**: Check JSON structure, required fields, field types

---

### "Unauthorized"

**Meaning**: Missing or invalid authentication

**Fix**: Add valid `Authorization: ****** header

---

### "Forbidden"

**Meaning**: You don't have permission

**Fix**: Check your role, ask admin for access, verify organization

---

### "Resource not found"

**Meaning**: The resource you're looking for doesn't exist

**Fix**: Check ID, verify resource wasn't deleted, list to find correct ID

---

### "Configuration required"

**Meaning**: A provider or setting is not configured

**Fix**: Go to Settings, configure the provider, add credentials

---

### "Insufficient credits"

**Meaning**: Not enough credits for the operation

**Fix**: Add credits to your account

---

### "Service unavailable"

**Meaning**: Server is temporarily down

**Fix**: Wait and retry, check status page

---

## HTTP Headers Reference

### Request Headers

```
Authorization: ******
Content-Type: application/json
X-Request-ID: <optional-id-for-tracking>
```

### Response Headers

```
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

The rate limit headers show:
- **X-RateLimit-Limit**: Maximum requests allowed
- **X-RateLimit-Remaining**: Requests left in window
- **X-RateLimit-Reset**: Unix timestamp when limit resets

---

## Retry Strategy Template

```typescript
interface RetryConfig {
  maxRetries?: number;      // Default: 3
  initialDelay?: number;    // Default: 1000ms
  maxDelay?: number;        // Default: 30000ms
  backoffMultiplier?: number; // Default: 2
}

async function callApiWithRetry(
  fn: () => Promise<Response>,
  config: RetryConfig = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2
  } = config;

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fn();
      
      // Don't retry on 4xx errors except 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }
      
      if (response.ok) {
        return response;
      }

      // Retry on 429 (rate limit) and 5xx
      if (response.status === 429 || response.status >= 500) {
        if (attempt === maxRetries) return response;
      } else {
        return response; // Don't retry other 4xx
      }
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) break;
    }

    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
```

---

## Related Documentation

- [API Error Handling Details](/docs/api/error-handling.md)
- [Error Handling Patterns (Architecture)](/docs/architecture/error-handling-patterns.md)
- [Error Handling Guide](/docs/guides/error-handling-guide.md)
- [Authentication](/docs/api/authentication.md)
- [Rate Limiting](/docs/advanced/rate-limiting.md)
- [Billing & Credits](/docs/features/credits-and-billing.md)
