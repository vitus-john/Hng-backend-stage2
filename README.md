# HNG Backend API Integration (Stage 1)

Profile Intelligence Service built with Node.js, Express, and MongoDB.

## Live Base URL

Set this after deployment:

```link
https://airtable-profile.vercel.app
```

## Features

- Integrates Genderize, Agify, and Nationalize APIs
- Stores enriched profiles in MongoDB
- Uses UUID v7 for all profile IDs
- Enforces idempotency by name (case-insensitive)
- Supports profile listing with optional case-insensitive filters
- Returns consistent JSON error responses
- Adds CORS header `Access-Control-Allow-Origin: *`

## Endpoints

### 1. Create Profile

`POST /api/profiles`

Request body:

```json
{ "name": "john" }
```

Success (201):

```json
{
  "status": "success",
  "data": {
    "id": "019d93b4-8275-7206-b7ed-39b63d82afdb",
    "name": "john",
    "gender": "male",
    "gender_probability": 1,
    "sample_size": 2692560,
    "age": 75,
    "age_group": "senior",
    "country_id": "NG",
    "country_probability": 0.07613817567167579,
    "created_at": "2026-04-16T00:32:53.877Z"
  }
}
```

If profile already exists (200):

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": {
    "id": "019d93b4-8275-7206-b7ed-39b63d82afdb",
    "name": "john",
    "gender": "male",
    "gender_probability": 1,
    "sample_size": 2692560,
    "age": 75,
    "age_group": "senior",
    "country_id": "NG",
    "country_probability": 0.07613817567167579,
    "created_at": "2026-04-16T00:32:53.877Z"
  }
}
```

### 2. Get Single Profile

`GET /api/profiles/:id`

Success (200): returns full stored profile.

```json
{
  "status": "success",
  "data": {
    "id": "019d93b4-8275-7206-b7ed-39b63d82afdb",
    "name": "john",
    "gender": "male",
    "gender_probability": 1,
    "sample_size": 2692560,
    "age": 75,
    "age_group": "senior",
    "country_id": "NG",
    "country_probability": 0.07613817567167579,
    "created_at": "2026-04-16T00:32:53.877Z"
  }
}
```

### 3. Get All Profiles

`GET /api/profiles`

Optional query params (case-insensitive):

- `gender`
- `country_id`
- `age_group`

Example:

`GET /api/profiles?gender=male&country_id=NG`

Success (200):

```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": "019d93b4-8275-7206-b7ed-39b63d82afdb",
      "name": "john",
      "gender": "male",
      "age": 75,
      "age_group": "senior",
      "country_id": "NG"
    }
  ]
}
```

### 4. Delete Profile

`DELETE /api/profiles/:id`

Success: `204 No Content`

## Error Format

All errors use:

```json
{ "status": "error", "message": "<error message>" }
```

Status codes:

- `400` Missing or empty name
- `422` Invalid type
- `404` Profile not found
- `502` Upstream invalid response or upstream failure
- `500` Internal server error

External API validation errors:

- `Genderize returned an invalid response`
- `Agify returned an invalid response`
- `Nationalize returned an invalid response`

## Local Setup

1.Install dependencies:

```bash
npm install
```

2.Create `.env` file:

```env
PORT=5000
HNG_DATABASE_MONGODB_URI="mongodb+srv://Vercel-Admin-HNG_DATABASE:gxh4Wfw3KakckvlZ@hng-database.oj1yp94.mongodb.net/?retryWrites=true&w=majority"
```

3.Start server:

```bash
npm start
```

or

```bash
npm run dev
```

## Submission Checklist

- Public GitHub repository with this README
- Public API base URL (Vercel, Railway, Heroku, AWS, PXXL, etc.)
- Endpoints live and reachable during grading
