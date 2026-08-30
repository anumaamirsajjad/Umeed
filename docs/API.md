# API Documentation

## Base URL

```
Development: http://localhost:5000
Production: [To be configured]
```

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Chat

**POST** `/chat`

Send a message to the chatbot and receive an empathetic response. If crisis language is detected, crisis resources are returned.

**Request:**
```json
{
  "message": "I've been feeling really down lately",
  "conversationId": "conv-789",
  "preferences": {
    "preferredSupportStyle": "family_community",
    "topicsToAvoid": ["medication"],
    "topicsOfConcern": ["work stress"],
    "languages": ["en"]
  }
}
```

**Parameters:**
- `message` (string, required): User's message
- `conversationId` (string, optional): Conversation ID; omit to start a new conversation
- `preferences` (object, optional): User preferences from onboarding
  - `preferredSupportStyle` (enum): "family_community" | "professional" | "solo" | "mixed"
  - `topicsToAvoid` (array): Topics the user prefers not to discuss
  - `topicsOfConcern` (array, optional): What's currently on their mind, captured at onboarding
  - `languages` (array): Preferred languages (ISO 639-1 codes)

**Response:**
```json
{
  "id": "msg-456",
  "conversationId": "conv-789",
  "message": "I hear you. That sounds really difficult...",
  "isCrisis": false,
  "crisisAlert": null,
  "suggestedResources": []
}
```

**Crisis Response Example:**
```json
{
  "id": "msg-457",
  "conversationId": "conv-789",
  "message": "I'm really concerned about what you're sharing...",
  "isCrisis": true,
  "crisisAlert": {
    "triggered": true,
    "severity": "critical",
    "message": "If you're having thoughts of suicide or self-harm, please reach out to a crisis helpline immediately.",
    "resources": [
      {
        "id": "us-988-lifeline",
        "name": "988 Suicide & Crisis Lifeline",
        "type": "crisis_hotline",
        "region": "north-america",
        "country": "United States",
        "phone": "988",
        "web": "https://988lifeline.org",
        "languages": ["en", "es"],
        "availability": "24/7"
      }
    ]
  }
}
```

---

### Conversations

**GET** `/conversations`

List all conversations for the authenticated user, sorted by most recently updated first.

**Response:**
```json
[
  {
    "id": "conv-789",
    "userId": "user-123",
    "title": "Work stress and coping",
    "detectedLanguage": "english",
    "createdAt": "2026-08-21T14:23:45Z",
    "updatedAt": "2026-08-21T16:45:12Z"
  },
  ...
]
```

**Status Codes:**
- `200`: List retrieved successfully
- `401`: Unauthorized (missing or invalid token)

---

**GET** `/conversations/:id`

Retrieve a specific conversation and all its messages.

**Response:**
```json
{
  "conversation": {
    "id": "conv-789",
    "userId": "user-123",
    "title": "Work stress and coping",
    "detectedLanguage": "english",
    "createdAt": "2026-08-21T14:23:45Z",
    "updatedAt": "2026-08-21T16:45:12Z"
  },
  "messages": [
    {
      "id": "msg-456",
      "conversationId": "conv-789",
      "content": "I've been feeling really down lately",
      "role": "user",
      "createdAt": "2026-08-21T14:23:45Z"
    },
    {
      "id": "msg-457",
      "conversationId": "conv-789",
      "content": "I hear you. That sounds really difficult...",
      "role": "assistant",
      "createdAt": "2026-08-21T14:24:10Z"
    }
  ]
}
```

**Status Codes:**
- `200`: Conversation retrieved successfully
- `401`: Unauthorized (missing or invalid token)
- `404`: Conversation not found or not owned by user

---

**PATCH** `/conversations/:id`

Rename a conversation.

**Request:**
```json
{
  "title": "New conversation title"
}
```

**Parameters:**
- `title` (string, required): New conversation title (cannot be empty)

**Response:**
```json
{
  "id": "conv-789",
  "userId": "user-123",
  "title": "New conversation title",
  "detectedLanguage": "english",
  "createdAt": "2026-08-21T14:23:45Z",
  "updatedAt": "2026-08-21T17:00:00Z"
}
```

**Status Codes:**
- `200`: Conversation updated successfully
- `400`: Invalid request (missing or empty title)
- `401`: Unauthorized (missing or invalid token)
- `404`: Conversation not found or not owned by user

---

**DELETE** `/conversations/:id`

Delete a conversation and all its messages.

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200`: Conversation deleted successfully
- `401`: Unauthorized (missing or invalid token)
- `404`: Conversation not found or not owned by user

---

### Onboarding - Save Preferences

**POST** `/onboarding/preferences`

Store user preferences from the onboarding flow.

**Request:**
```json
{
  "preferredSupportStyle": "family_community",
  "topicsToAvoid": ["medication", "grief"],
  "topicsOfConcern": ["work stress", "family relationships"],
  "languages": ["en", "es"],
  "culturalContext": "First-generation immigrant, family-centered values"
}
```

**Response:**
```json
{
  "userId": "user-123",
  "preferences": {
    "id": "pref-789",
    "userId": "user-123",
    "preferredSupportStyle": "family_community",
    "topicsToAvoid": ["medication", "grief"],
    "topicsOfConcern": ["work stress", "family relationships"],
    "languages": ["en", "es"],
    "culturalContext": "First-generation immigrant, family-centered values",
    "createdAt": "2026-08-21T14:23:45Z",
    "updatedAt": "2026-08-21T14:23:45Z"
  }
}
```

**Status Codes:**
- `200`: Preferences saved successfully
- `400`: Invalid request body
- `500`: Server error

---

### Onboarding - Get Preferences

**GET** `/onboarding/preferences/:userId`

Retrieve stored preferences for a user.

**Response:**
```json
{
  "id": "pref-789",
  "userId": "user-123",
  "preferredSupportStyle": "family_community",
  "topicsToAvoid": ["medication"],
  "topicsOfConcern": ["work stress"],
  "languages": ["en"],
  "culturalContext": null,
  "createdAt": "2026-08-21T14:23:45Z",
  "updatedAt": "2026-08-21T14:23:45Z"
}
```

**Status Codes:**
- `200`: Preferences found
- `404`: User preferences not found

---

### Safety Plan - Save

**POST** `/safety-plan`

Create or update a safety plan for a user.

**Request:**
```json
{
  "userId": "user-123",
  "warningSigns": [
    "Withdrawing from friends",
    "Sleeping too much",
    "Feeling hopeless"
  ],
  "copingStrategies": [
    "Call mom",
    "Go for a walk",
    "Journal my feelings",
    "Listen to music"
  ],
  "trustedContacts": [
    {
      "name": "Mom",
      "relationship": "mother",
      "phone": "+1-555-0100"
    },
    {
      "name": "Dr. Smith",
      "relationship": "therapist",
      "phone": "+1-555-0101"
    }
  ],
  "reasonsToStaySafe": [
    "My kids need me",
    "I want to see my nephew graduate",
    "I have more to give"
  ]
}
```

**Response:**
```json
{
  "id": "plan-101",
  "userId": "user-123",
  "warningSigns": [...],
  "copingStrategies": [...],
  "trustedContacts": [...],
  "reasonsToStaySafe": [...],
  "createdAt": "2026-08-21T14:23:45Z",
  "updatedAt": "2026-08-21T14:23:45Z"
}
```

---

### Safety Plan - Get

**GET** `/safety-plan/:userId`

Retrieve a user's safety plan.

**Response:**
```json
{
  "id": "plan-101",
  "userId": "user-123",
  "warningSigns": [...],
  "copingStrategies": [...],
  "trustedContacts": [...],
  "reasonsToStaySafe": [...],
  "createdAt": "2026-08-21T14:23:45Z",
  "updatedAt": "2026-08-21T14:23:45Z"
}
```

**Status Codes:**
- `200`: Safety plan found
- `404`: No safety plan found for this user

---

### Safety Plan - Export PDF

**GET** `/safety-plan/:userId/export`

Export the safety plan as a printable PDF.

**Response:**
Binary PDF file with Content-Type: `application/pdf`

**Status Codes:**
- `200`: PDF generated and returned
- `404`: No safety plan found for this user
- `500`: PDF generation failed

---

### Resources - List

**GET** `/resources`

Get crisis and professional resources, optionally filtered.

**Query Parameters:**
- `region` (string, optional): Filter by region (e.g., "north-america", "south-asia")
- `country` (string, optional): Filter by country
- `type` (string, optional): Filter by type ("crisis_hotline", "professional", "support_group", "online_resource")

**Examples:**
```
GET /resources?region=north-america
GET /resources?country=United States
GET /resources?type=crisis_hotline
GET /resources?region=south-asia&type=crisis_hotline
```

**Response:**
```json
[
  {
    "id": "us-988-lifeline",
    "name": "988 Suicide & Crisis Lifeline",
    "type": "crisis_hotline",
    "region": "north-america",
    "country": "United States",
    "phone": "988",
    "web": "https://988lifeline.org",
    "languages": ["en", "es"],
    "availability": "24/7",
    "description": "Call or text 988 for free, confidential support..."
  },
  ...
]
```

---

### Resources - Search

**GET** `/resources/search`

Search for resources by name or description.

**Query Parameters:**
- `q` (string, required): Search query

**Example:**
```
GET /resources/search?q=suicide prevention
GET /resources/search?q=counseling
```

**Response:**
```json
[
  {
    "id": "us-988-lifeline",
    "name": "988 Suicide & Crisis Lifeline",
    ...
  },
  ...
]
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Bad Request",
  "message": "Missing required field: message",
  "statusCode": 400
}
```

### Common Status Codes

- `400`: Bad Request (invalid parameters)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Authentication

All endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /auth/login` (email, password) or `POST /auth/signup` (email, password). Include the token in the `Authorization` header on all subsequent requests. The token expires after 7 days; users must re-authenticate to continue.

---

## Rate Limiting

Not implemented for hackathon. Should be added before production use.

---

## CORS

The API accepts requests from `CORS_ORIGIN` environment variable (default: `http://localhost:3000`).

---

## Conversation Flow (Example)

```
1. User visits site
2. Frontend requests GET /health to verify backend is running
3. User enters onboarding → Frontend posts to POST /onboarding/preferences
4. User navigates to chat
5. User types message → Frontend sends POST /chat with message + userId + preferences
6. Backend detects crisis → returns isCrisis=true with resources
7. Frontend displays crisis alert with resources
8. User builds safety plan → Frontend posts to POST /safety-plan
9. User requests PDF → Frontend calls GET /safety-plan/:userId/export
10. User browses resources → Frontend calls GET /resources?region=xxx
```

---

## Development Notes

- All requests/responses are JSON
- Timestamps are ISO 8601 format
- User IDs can be any unique string (UUID recommended)
- Preferences are optional on first chat message
- Crisis detection runs on every message (server-side)
- Conversations, messages, preferences, and safety plans persist across sessions
