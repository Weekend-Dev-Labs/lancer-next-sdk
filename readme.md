# `@lancer/next`

Lancer Server SDK for Next.js

## Overview

`@lancer/next` is the official server-side SDK for integrating Lancer with Next.js applications. It simplifies handling Lancer webhooks and authentication workflows, ensuring secure and efficient communication between your Next.js backend and Lancer's APIs.

## Features

- **Webhook Handling** : Securely process and verify Lancer webhook events.
- **Authentication Flows** : Authenticate Lancer sessions and manage custom session logic.
- **Next.js Compatibility**: Designed for use in Next.js API routes (/api).

## Installation

Install the SDK via npm:

```bash
npm install @lancer/next
```

## Getting Started

### 1. Initialize the Lancer SDK
Create a reusable instance of the Lancer class with your webhookSecret for signature verification. Store this in a shared module for easy access across your API routes.

```typescript
import Lancer from "@lancer/next";

const lancer = new Lancer({
  webhookSecret: "<your-lancer-webhook-secret>",
});

export default lancer;
```

# `@lancer/next`

**Lancer Server SDK for Next.js**

---

## **Overview**

`@lancer/next` is the official server-side SDK for integrating **Lancer** with Next.js applications. It simplifies handling **Lancer webhooks** and **authentication workflows**, ensuring secure and efficient communication between your Next.js backend and Lancer's APIs.

---

## **Features**

- **Webhook Handling**: Securely process and verify Lancer webhook events.
- **Authentication Flows**: Authenticate Lancer sessions and manage custom session logic.
- **Next.js Compatibility**: Designed for use in Next.js API routes (`/api`).

---

## **Installation**

Install the SDK via npm:

```bash
npm install @lancer/next
```

---

## **Getting Started**

### **1. Initialize the Lancer SDK**

Create a reusable instance of the `Lancer` class with your `webhookSecret` for signature verification. Store this in a shared module for easy access across your API routes.

```typescript
import Lancer from "@lancer/next";

const lancer = new Lancer({
  webhookSecret: "<your-lancer-webhook-secret>",
});

export default lancer;
```

| Parameter       | Type     | Required | Description                                     |
|-----------------|----------|----------|-------------------------------------------------|
| `webhookSecret` | `string` | No       | Secret key used to verify webhook signatures.  |

---

### **2. Set Up API Routes**

### **Authentication Endpoint**

Use the `authenticate` method to handle session authentication in a Next.js API route. Implement your custom logic within the handler.

```typescript
import lancer from "@/lib/lancer";

export const POST = lancer.authenticate(async (token, payload) => {
  console.log("Session Payload:", payload);

  // Custom authentication logic
  return {
    ownerId: "<user-id>", // Replace with actual user/owner ID
    status: 200, // HTTP status code
  };
});
```

| Parameter    | Type                     | Description                                    |
|--------------|--------------------------|------------------------------------------------|
| `token`      | `string`                 | Lancer session token from the `Authorization` header. |
| `payload`    | `SessionRequest`         | Payload containing session details from Lancer. |

##### Example Request
```bash
POST /api/auth
Authorization: Bearer <token>
{
  "file_size": 10485760,     
  "file_name": "example.txt",
  "max_chunk": 2,            
  "chunk_size": 5242880,     
  "provider": "LOCAL"    
}
```

##### Example Response
```json
{
  "ownerId": "user123"
}
```

### **Webhook Endpoint**

Handle webhook events sent by Lancer with the `handleWebhook` method. Enable verification to ensure payload integrity using your `webhookSecret`.

```typescript
import lancer from "@/lib/lancer";

export const POST = lancer.handleWebhook(async (event) => {
  console.log("Webhook Event: ", event.event);

  console.log("Webhook Data: ", event.data);

  // Handle event data
  return Response.json({}, { status: 200 });
}, true);
```

| Parameter       | Type                                              | Description                                                   |
|-----------------|---------------------------------------------------|---------------------------------------------------------------|
| `handler`       | `(event: WebhookEvent) => Promise<Response>`       | Callback function to process webhook events.                 |
| `verification`  | `boolean`                                         | Enables payload verification (default: `true`).              |

##### Verification Workflow
- The SDK verifies the `x-timestamp` and `x-signature` headers.
- The payload is signed using HMAC SHA-256 and compared to the provided signature.
- If the verification fails, the SDK responds with `403 Access Restricted`.


##### Example Webhook Payload
```json
{
  "type": "FILE_UPLOAD",
  "data": {
    "id": "session-12345",
    "file_size": 10485760,
    "chunk_size": 5242880,
    "max_chunk": 2,
    "file_name": "example.txt",
    "temp_path": "/tmp/session-12345",
    "owner_id": "user-67890",
    "current_chunk": 0,
    "provider": "LOCAL"
  }
}
```
### Important 

Add the authentication endpoints & webhook handling payload to `lancer` config file as `auth-endpoint` & `webhook-endpoint`

---

## **Security Best Practices**

1. **Protect Your Webhook Secret**: Ensure your `webhookSecret` is stored securely in environment variables.
2. **Verify Signatures**: Always enable `verification` for sensitive webhook endpoints.
3. **Rate Limit Your API**: Use rate-limiting middleware to prevent abuse.

---

## **License**

MIT License © 2025 Weekend Dev Labs