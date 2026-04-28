# CrimeInsight

CrimeInsight is a crime management and analysis system built with:

- React + TypeScript frontend
- Express + MySQL backend
- MySQL relational schema with views, trigger, and stored procedure

## Project Structure

- `src/`: frontend application
- `server/`: Express API and MySQL integration
- `database/crimeinsight.sql`: bootstrap schema and seed data
- `docs/CRIMEINSIGHT_PROJECT_DOCUMENTATION.md`: repo-aligned project documentation
- `docs/CRIMEINSIGHT_PROJECT_REPORT.md`: submission-style project report

## Frontend Setup

From the project root:

```sh
npm install
npm run dev
```

The frontend runs on:

```txt
http://localhost:8080
```

## Backend Setup

From the `server/` directory:

```sh
cd server
npm install
npm run dev
```

The backend runs on:

```txt
http://localhost:5001
```

Copy [server/.env.example](/Users/koushalgupthaedupulapatisrinivasa/Downloads/insight-command-main/server/.env.example) to `server/.env` and fill in your values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=CRIMEINSIGHT
PORT=5001
AUTH_SECRET=change-this-secret
```

## Database Setup

Run the schema bootstrap:

```sh
mysql -u <username> -p < /Users/koushalgupthaedupulapatisrinivasa/Downloads/insight-command-main/database/crimeinsight.sql
```

Then start the backend. On startup it will:

- migrate legacy plain-text officer passwords to hashed passwords
- ensure the `PATROL_DISPATCH` table exists

## Authentication

Current login uses the `OFFICER` table.

Sample credentials from the bootstrap SQL:

- `admin / admin123`
- `inspector1 / police123`

The backend now issues a signed auth token and protects API routes with role checks.

## Project Review Checklist

Before review/demo:

1. Start MySQL and verify the `CRIMEINSIGHT` schema exists.
2. Start backend with a valid `AUTH_SECRET`.
3. Start frontend from the project root.
4. Verify login with `admin / admin123`.
5. Verify one full CRUD cycle each for:
   - crime
   - criminal
   - victim
   - court case
   - patrol
   - police station
6. Verify the Reports page loads without API errors.
7. Confirm changes in MySQL Workbench.

## Verification

Frontend:

```sh
npm run build
npm run lint
```

Backend:

```sh
cd server
npm run dev
```

Health check:

```txt
GET http://localhost:5001/api/health
```
