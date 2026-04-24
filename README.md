# HNG Backend API Integration (Stage 2)

Profile Intelligence Query Engine built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- Advanced filtering, sorting, and pagination on `GET /api/profiles`
- Rule-based natural language query parsing on `GET /api/profiles/search`
- CORS enabled with `Access-Control-Allow-Origin: *`
- UTC ISO 8601 timestamps (`created_at`)
- UUID v7 IDs for seeded records
- Idempotent seeding (`createMany` + `skipDuplicates`)
- Consistent error payloads:

```json
{ "status": "error", "message": "<error message>" }
```

## Database Schema

`Profile` model fields:

- `id` (UUID, primary key)
- `name` (varchar, unique)
- `gender` (varchar, values: `male` or `female`)
- `gender_probability` (float)
- `age` (int)
- `age_group` (varchar, values: `child`, `teenager`, `adult`, `senior`)
- `country_id` (varchar(2), ISO code)
- `country_name` (varchar)
- `country_probability` (float)
- `created_at` (timestamp with timezone, default now)

Indexes are applied on filter/sort columns to reduce expensive scans.

## Endpoints

### 1. Get All Profiles

`GET /api/profiles`

Supported filters (combinable):

- `gender`
- `age_group`
- `country_id`
- `min_age`
- `max_age`
- `min_gender_probability`
- `min_country_probability`

Sorting:

- `sort_by`: `age` | `created_at` | `gender_probability`
- `order`: `asc` | `desc`

Pagination:

- `page` (default `1`)
- `limit` (default `10`, max `50`)

Example:

`/api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10`

Success response:

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": [
    {
      "id": "0196100f-4e45-77ef-bca2-cd70657f8f34",
      "name": "emmanuel",
      "gender": "male",
      "gender_probability": 0.99,
      "age": 34,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.85,
      "created_at": "2026-04-01T12:00:00.000Z"
    }
  ]
}
```

### 2. Natural Language Search

`GET /api/profiles/search?q=<plain english>&page=1&limit=10`

Example:

`/api/profiles/search?q=young males from nigeria`

If parsing fails:

```json
{ "status": "error", "message": "Unable to interpret query" }
```

## Natural Language Parsing Approach

Parser is fully rule-based (no AI/LLM). Implemented in [services/nlpParser.js](services/nlpParser.js).

### Supported Keyword Mappings

Gender keywords:

- `male`, `males`, `man`, `men`, `boy`, `boys` -> `gender=male`
- `female`, `females`, `woman`, `women`, `girl`, `girls` -> `gender=female`
- If both male and female terms are present, no gender filter is applied.

Age keywords:

- `young` -> `min_age=16`, `max_age=24`
- `teen`, `teens`, `teenager`, `teenagers` -> `age_group=teenager`
- `adult`, `adults` -> `age_group=adult`
- `senior`, `seniors`, `elderly` -> `age_group=senior`
- `child`, `children`, `kid`, `kids` -> `age_group=child`

Numeric age patterns:

- `above 30`, `over 30`, `older than 30`, `at least 30` -> `min_age=30`
- `below 20`, `under 20`, `younger than 20`, `at most 20` -> `max_age=20`
- `between 18 and 25` -> `min_age=18`, `max_age=25`

Country matching:

- Country names (for example `nigeria`, `angola`, `south africa`) map to ISO country code (`NG`, `AO`, `ZA`)
- Two-letter country codes in text (for known countries) are accepted (`NG`, `KE`, etc.)

The parser normalizes punctuation and spacing before matching.

## Parser Limitations

- Does not support fuzzy spelling correction (example: `nigerai` will fail)
- Does not support deeply complex grammar (`young men not from nigeria above 30`)
- Does not infer advanced boolean precedence with nested logic
- Only supports the configured country map; unsupported countries are ignored
- Mixed contradictory age intent may produce combined filters that return zero results

## Error Handling

All errors follow:

```json
{ "status": "error", "message": "<error message>" }
```

Implemented status behavior:

- `400` missing/empty required parameters, invalid query parameters, uninterpretable search
- `422` invalid parameter type
- `404` route not found
- `500` server failure

## Local Setup

1. Install dependencies:

```bash
npm install
```

1. Add environment variables in `.env`:

```env
PORT=5000
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?schema=public"
```

1. Generate Prisma client and apply schema:

```bash
npm run prisma:generate
npx prisma db push
```

1. Add the provided 2026 dataset file at:

`data/seed_profiles.json`

Supported JSON shapes:

- Top-level array: `[{ ...profile }]`
- Wrapped object: `{ "profiles": [{ ...profile }] }`

Or set a custom path:

```env
SEED_FILE="D:/path/to/profiles-2026.json"
```

1. Seed data:

```bash
npm run seed
```

Re-running seed will not duplicate records due to unique `name` and `skipDuplicates`.

1. Start server:

```bash
npm run dev
```

## Quick Validation Checklist

- `GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10`
- `GET /api/profiles/search?q=young%20males%20from%20nigeria&page=1&limit=10`
- `GET /api/profiles/search?q=` returns `400`
- `GET /api/profiles?limit=abc` returns `422`
- Verify response header: `Access-Control-Allow-Origin: *`
