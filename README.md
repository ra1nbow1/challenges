# Programming challenges

Simplified CodeWars website.
Fullstack web application made with React and Express.

JavaScript version is available in the commit history.

## Installation

```bash
npm i
cd server
npm i
```

Create `.env` file in `server/` and paste

```env
MONGO_URL="database_uri"
DB_NAME="database_name"
COLLECTION_NAME="collection_name"
```

## Usage

```bash
npm run dev
cd server
npm start
```

## Database

Each database element looks like this:

```json
{
"pid": "string",
"title": "string",
"instructions": "string",
"difficulty": "<easy|normal|hard>",
"test_cases": ["solution(args1) == result1", "solution(args2) == result2"],
"code": "string"
}
```
