---
id: error-handling-guide
title: Error Handling Guide
sidebar_label: Error Handling Guide
sidebar_position: 15
---

# Error Handling Guide

A comprehensive guide to understanding, handling, and debugging errors in Ever Works applications. This guide covers both API errors and client-side error handling for developers integrating with or building on Ever Works.

## Quick Start

### Common HTTP Status Codes

| Status | Name | Meaning | What to Do |
| ------ | ---- | ------- | ---------- |
| 200 | OK | Request succeeded | No action needed |
| 400 | Bad Request | Invalid input or missing required fields | Check your request payload and parameters |
| 401 | Unauthorized | Missing or invalid authentication | Provide a valid JWT token in `Authorization` header |
| 402 | Payment Required | Insufficient AI credits or budget exceeded | Add credits or increase budget limits |
| 403 | Forbidden | You lack permission or access to this resource | Check user role or access rights |
| 404 | Not Found | Resource does not exist | Verify the resource ID or endpoint path |
| 409 | Conflict | Configuration or state conflict (e.g., no provider configured) | Configure missing providers or reconnect accounts |
| 429 | Too Many Requests | Rate limit exceeded | Wait before retrying; use exponential backoff |
| 500 | Internal Server Error | Unexpected server error | Retry after a few seconds; contact support if persists |
| 503 | Service Unavailable | Server temporarily unavailable | Retry with exponential backoff |

## API Error Response Format

All Ever Works API errors follow a consistent JSON structure:

```json
{
	"statusCode": 400,
	"message": "Descriptive error message",
	"error": "Bad Request"
}
```

For validation errors with multiple issues:

```json
{
	"statusCode": 400,
	"message": [
		"url must be a URL address",
		"viewportWidth must not be greater than 3840"
	],
	"error": "Bad Request"
}
```

### Response Fields

- **statusCode**: HTTP status code (400, 401, 402, etc.)
- **message**: User-friendly error message or array of validation errors
- **error**: Error type name (e.g., "Bad Request", "Unauthorized")

## Common Error Scenarios

### Authentication Errors (401)

**Problem**: You're getting a 401 error when calling the API.

**Common Causes**:
- Missing or expired JWT token
- Invalid API key
- Token format incorrect

**Solution**:
```typescript
// Correct: Include Authorization header
const response = await fetch('https://api.example.com/works', {
	headers: {
		'Authorization': `******
		'Content-Type': 'application/json'
	}
});

// Incorrect ❌
// const response = await fetch('https://api.example.com/works');
```

**See Also**: [Authentication Documentation](/docs/api/authentication.md)

---

### Validation Errors (400)

**Problem**: You're getting validation errors in response messages.

**Common Causes**:
- Invalid data type (e.g., string instead of number)
- Missing required fields
- Values outside allowed range
- Incorrect format (URL, email, UUID)

**Example**:
```json
{
	"statusCode": 400,
	"message": [
		"title must be a string",
		"viewportWidth must not be less than 320"
	],
	"error": "Bad Request"
}
```

**Solution**: Check the validation rules for each field in the endpoint documentation. Ensure:
- All required fields are provided
- Data types match expectations
- Values fall within specified ranges

**Common Validators**:
- `@IsString()` - Must be a string
- `@IsNumber()` - Must be a number
- `@IsEmail()` - Must be a valid email address
- `@IsUrl()` - Must be a valid URL
- `@IsUUID()` - Must be a valid UUID
- `@Min(n)` / `@Max(n)` - Must fall within numeric range
- `@IsIn([...])` - Must be one of the specified values

---

### Configuration Errors (409)

**Problem**: You're getting a 409 Conflict error when trying to perform an operation.

**Common Causes**:
- No AI provider configured
- No Git provider connected
- No deployment provider configured
- Missing credentials or API keys

**Example**:
```json
{
	"statusCode": 409,
	"message": "No screenshot provider configured",
	"error": "Conflict"
}
```

**Solution**: 
1. Go to Plugin Settings
2. Enable the required provider plugin
3. Add credentials or API key
4. Test the connection
5. Retry the operation

**Related Providers**:
- **AI Providers** (OpenAI, Anthropic, Google, Groq, Ollama, etc.)
- **Git Providers** (GitHub)
- **Deploy Providers** (Vercel, custom deployment)
- **Search Providers** (Tavily, Brave, Exa, etc.)
- **Screenshot Providers** (ScreenshotOne, URLBox, Scrapfly)
- **Content Extractors** (Firecrawl, Notion, PDF, Jina)

**See Also**: [Plugins Documentation](/docs/features/plugins.md)

---

### Credit and Budget Errors (402)

**Problem**: You're getting a 402 Payment Required error.

**Causes**:
- AI credits exhausted
- Monthly work budget exceeded
- Insufficient balance for the requested operation

**Example**:
```json
{
	"statusCode": 402,
	"error": "InsufficientCredits",
	"message": "Insufficient AI credits"
}
```

**Solution**:
1. Check your credit balance at **Settings → Billing**
2. Add more credits to your account
3. Or increase your monthly budget if a limit is set
4. Retry the operation after adding credits

**To Monitor Usage**:
- View real-time usage in **Dashboard → Credits**
- Set up budget alerts
- Use the `/api/credits/balance` endpoint to check programmatically

**See Also**: [Billing Documentation](/docs/features/credits-and-billing.md)

---

### Rate Limiting Errors (429)

**Problem**: You're getting "Too Many Requests" errors.

**Causes**:
- Exceeding the rate limit for your plan
- Burst of requests too close together

**Example**:
```json
{
	"statusCode": 429,
	"message": "ThrottlerException: Too Many Requests"
}
```

**Rate Limits**:
- **Short term** (1 second): 50 requests
- **Medium term** (10 seconds): 300 requests  
- **Long term** (1 minute): 1000 requests

**Solutions**:
1. **Implement exponential backoff**: Wait before retrying
```typescript
async function retryWithBackoff(fn, maxRetries = 5) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			if (error.statusCode === 429 && i < maxRetries - 1) {
				const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s...
				await new Promise(resolve => setTimeout(resolve, delay));
			} else {
				throw error;
			}
		}
	}
}
```

2. **Batch requests**: Combine multiple operations into fewer calls

3. **Spread requests over time**: Instead of bursts, send requests evenly

**See Also**: [Rate Limiting Documentation](/docs/advanced/rate-limiting.md)

---

### Resource Not Found Errors (404)

**Problem**: Getting "Not Found" for a resource you believe exists.

**Common Causes**:
- Incorrect resource ID
- Resource has been deleted
- User doesn't have access to the resource
- Typo in endpoint path

**Example**:
```json
{
	"statusCode": 404,
	"message": "Work not found",
	"error": "Not Found"
}
```

**Solution**:
1. Verify the resource ID is correct
2. Check that the resource hasn't been deleted
3. Ensure you're using the correct endpoint path
4. Verify you have access to the resource

---

### Internal Server Errors (500)

**Problem**: Getting "Internal Server Error" responses.

**Causes**:
- Unexpected server-side issue
- Temporary service outage
- Database connectivity problem
- Processing timeout

**Solution**:
1. **Retry with backoff** (the error is usually temporary)
2. **Check status page** for known issues
3. **Contact support** if the error persists
4. **Review logs** if you're self-hosting

```typescript
// Retry strategy
async function callWithRetry(fn, maxRetries = 3) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			if (error.statusCode >= 500 && i < maxRetries - 1) {
				await new Promise(resolve => 
					setTimeout(resolve, Math.pow(2, i) * 1000)
				);
			} else {
				throw error;
			}
		}
	}
}
```

---

## Handling Errors in Code

### Frontend (React/Next.js)

#### Basic Error Handling
```typescript
'use client';

import { useState } from 'react';

export function CreateWorkButton() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleCreateWork() {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/works', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'My Work' })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || `Error: ${response.status}`);
			}

			const work = await response.json();
			console.log('Created:', work);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<button onClick={handleCreateWork} disabled={loading}>
				{loading ? 'Creating...' : 'Create Work'}
			</button>
			{error && <div className="error">{error}</div>}
		</>
	);
}
```

#### Handling Different Error Types
```typescript
async function apiCall(url: string, options?: RequestInit) {
	const response = await fetch(url, options);

	if (!response.ok) {
		const data = await response.json();
		
		// Handle specific status codes
		if (response.status === 401) {
			// Clear auth and redirect to login
			localStorage.removeItem('token');
			window.location.href = '/login';
			throw new Error('Session expired');
		}
		
		if (response.status === 402) {
			// Show upgrade prompt
			throw new Error('Insufficient credits. Please upgrade.');
		}
		
		if (response.status === 409) {
			// Show configuration prompt
			throw new Error(`Configuration needed: ${data.message}`);
		}
		
		if (response.status === 429) {
			// Implement retry logic
			throw new Error('Too many requests. Please wait before retrying.');
		}
		
		if (response.status >= 500) {
			// Log and show generic message
			console.error('Server error:', data);
			throw new Error('Server error. Please try again later.');
		}
		
		throw new Error(data.message || `Request failed: ${response.status}`);
	}

	return response.json();
}
```

#### Using SWR with Error Handling
```typescript
'use client';

import useSWR from 'swr';

const fetcher = async (url: string) => {
	const res = await fetch(url, {
		headers: { 'Authorization': `****** }
	});
	
	if (!res.ok) {
		const error = new Error('Fetch error');
		const data = await res.json();
		error.message = data.message || res.statusText;
		(error as any).status = res.status;
		throw error;
	}
	
	return res.json();
};

export function WorksList() {
	const { data, error, isLoading } = useSWR('/api/works', fetcher);

	if (error) {
		return (
			<div className="error">
				{error.status === 401 ? 'Please log in' : 'Failed to load works'}
			</div>
		);
	}

	if (isLoading) return <div>Loading...</div>;
	if (!data) return null;

	return (
		<ul>
			{data.map((work: any) => (
				<li key={work.id}>{work.title}</li>
			))}
		</ul>
	);
}
```

---

### Backend (NestJS)

#### Service-Level Error Handling
```typescript
import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WorkService {
	private readonly logger = new Logger(WorkService.name);

	async createWork(dto: CreateWorkDto, userId: string) {
		try {
			// Validate input
			if (!dto.title || dto.title.trim().length === 0) {
				throw new BadRequestException('Title is required');
			}

			// Call business logic
			const work = await this.workRepository.create({
				title: dto.title,
				ownerId: userId
			});

			return work;
		} catch (error) {
			// Log full error
			this.logger.error('Failed to create work', error);

			// Re-throw as appropriate HTTP exception
			if (error instanceof BadRequestException) {
				throw error; // Pass through
			}

			// Generic catch
			throw new HttpException(
				'Failed to create work',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
```

#### Controller-Level Error Handling
```typescript
import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { FacadeExceptionFilter } from '../common/filters/facade-exception.filter';

@Controller('works')
@UseFilters(FacadeExceptionFilter)
export class WorkController {
	constructor(private workService: WorkService) {}

	@Post()
	async create(@Body() dto: CreateWorkDto) {
		try {
			return await this.workService.createWork(dto);
		} catch (error) {
			// The FacadeExceptionFilter will handle FacadeErrors
			// Other exceptions should be handled here
			throw error;
		}
	}
}
```

#### Using Classification System
```typescript
import { classifyGenerationError, notifyForClassifiedError, rethrowAsNormalized } from '@ever-works/agent';

@Injectable()
export class GenerationService {
	async generateWork(work: Work, user: User) {
		try {
			// Perform generation
			return await this.generator.generate(work);
		} catch (error) {
			// Classify the error
			const classification = classifyGenerationError(error);

			// Notify user based on classification
			await notifyForClassifiedError(
				this.notificationService,
				user.id,
				work.id,
				work.title,
				classification
			);

			// Normalize and re-throw
			rethrowAsNormalized(error, this.logger, 'generating work');
		}
	}
}
```

---

## Error Classification System

Ever Works uses an intelligent error classification system to route errors to appropriate handlers and provide targeted user notifications.

### Classification Types

```typescript
type ErrorClassificationType = 
	| 'ai_credits'      // AI model billing/quota errors
	| 'ai_provider'     // AI provider auth/config errors
	| 'git_auth'        // Git provider auth errors
	| 'account_level'   // Account-level errors
	| 'unknown';        // Unclassified errors
```

### How It Works

1. **Detection**: Error messages are analyzed using keyword matching
2. **Classification**: Error is categorized into one of the types above
3. **Notification**: User is notified with targeted guidance
4. **Action**: User takes corrective action based on notification

### Supported AI Providers

The system auto-detects these AI providers:
- OpenAI
- Anthropic (Claude)
- Google (Gemini)
- Groq
- Ollama
- OpenRouter

### Example Classifications

| Error Message | Classification | Recommended Action |
| ------------- | --------------- | ------------------- |
| "Rate limit exceeded for API key" | `ai_credits` | Add credits |
| "Invalid API key provided" | `ai_provider` | Update provider credentials |
| "GitHub token expired" | `git_auth` | Reconnect GitHub |
| "Account suspended" | `account_level` | Contact support |

---

## Monitoring and Debugging

### Enable Debug Logging

Set the debug flag to enable detailed request/response logging:

```bash
DEBUG=true npm run dev:api
```

This enables the `LoggingInterceptor` which logs:
- HTTP method and URL
- Response status code
- Total request duration

### Integration with Error Tracking

#### Sentry Integration

Unhandled exceptions are automatically captured by Sentry when `SENTRY_DSN` is configured:

```bash
SENTRY_DSN=https://key@sentry.example.com/123
```

#### PostHog Analytics

API usage and errors are tracked in PostHog when `POSTHOG_API_KEY` is configured:

```bash
POSTHOG_API_KEY=ph_xxxx
```

### Checking Logs

For self-hosted deployments, check application logs:

```bash
# Docker Compose
docker-compose logs api

# Kubernetes
kubectl logs -f deployment/ever-works-api

# Docker
docker logs <container-id> --follow
```

---

## Best Practices

### For API Consumers

1. **Always check status codes** - Don't assume 200, validate the response status
2. **Use typed error handling** - Create error classes for each response type
3. **Implement retry logic** - Use exponential backoff for retryable errors (429, 5xx)
4. **Log errors with context** - Include request details when logging
5. **Handle 401 specially** - Clear auth and redirect to login
6. **Display user-friendly messages** - Map technical errors to user guidance
7. **Set reasonable timeouts** - Prevent hanging requests

### For Developers

1. **Use typed exceptions** - Prefer NestJS HTTP exceptions over generic Error
2. **Log before transforming** - Log original error before normalizing
3. **Classify before notifying** - Use the classification system for consistency
4. **Preserve HttpExceptions** - Use `rethrowAsNormalized()` to avoid double-wrapping
5. **Document error cases** - Add error examples to API documentation
6. **Test error paths** - Write tests for both happy and error paths
7. **Never expose internals** - Normalize error messages for external APIs

### Rate Limiting Best Practices

1. **Batch operations** - Combine multiple calls into one request when possible
2. **Stagger requests** - Spread requests over time rather than in bursts
3. **Cache responses** - Avoid redundant API calls
4. **Use webhooks** - Subscribe to events instead of polling
5. **Implement backoff** - Wait longer with each retry

---

## Troubleshooting

### "Invalid API Key" Error

**Problem**: Getting "Invalid API Key" for a provider you just configured.

**Solution**:
- API keys may take 5-10 minutes to activate after creation
- Verify the key is correct and hasn't been revoked
- Try copying/pasting the key again (check for whitespace)
- Generate a new key if the issue persists

### "No Provider Configured" Error

**Problem**: Getting "No screenshot provider configured" but you added one.

**Solution**:
- Refresh the page to reload plugin configuration
- Verify the provider is "Enabled" (not just installed)
- Check if the provider is available in your plan tier
- Restart the application if self-hosting

### Intermittent 500 Errors

**Problem**: Getting occasional 500 errors that disappear after retry.

**Causes**: Usually temporary database or external service issues

**Solution**:
- Implement exponential backoff retry logic
- Check the status page for known issues
- Monitor your infrastructure (if self-hosting)
- Contact support if errors are consistent

### Request Timeout Errors

**Problem**: Large operations are timing out.

**Solution**:
- Break the operation into smaller chunks
- Increase the request timeout on your client
- Check if there are query optimization opportunities
- Contact support if the issue persists

---

## Additional Resources

- [API Error Handling Details](/docs/api/error-handling.md)
- [Error Handling Patterns (Architecture)](/docs/architecture/error-handling-patterns.md)
- [Rate Limiting](/docs/advanced/rate-limiting.md)
- [Security Hardening](/docs/advanced/security-hardening.md)
- [Billing & Credits](/docs/features/credits-and-billing.md)
- [Plugins & Configuration](/docs/features/plugins.md)
