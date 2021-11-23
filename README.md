## Routes

### Health Check - GET /api/v1/health

Returns sample below
```typescript
{
  "uptime": number,
  "message": string,
  "date": string
}
```

### Register Account - POST /api/v1/register

Body sample below
```typescript
{
	"name": {
		"first": string,
		"last": string
	},
	"email": string,
	"password": string
}
```

Returns below response if successful
```json
{ success: true }
```

Returns `ErrorResponse` when unsuccessful

### Account Login - POST /api/v1/login

Body sample below
```typescript
{
	"email": string,
	"password": string
}
```

Returns below response if successful and sets cookie
```json
{ success: true }
```

## Error Responses

Below is the error response along with the status.
```typescript
HTTP Status Code: number
{
  error_code: string,
  error_message: string
}
```

Service errors include:
```
error_code: INVALID_REQUEST
status: 400

error_code: UNAUTHORIZED
status: 401

error_code: NOT_FOUND
status: 404

error_code: INTERNAL_SERVER_ERROR
status: 500

error_code: SERVICE_UNAVAILABLE
status: 503
```
