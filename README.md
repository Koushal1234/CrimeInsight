# CrimeInsight

CrimeInsight is a full-stack crime management and analysis system for recording
cases, managing related entities, coordinating patrols, and viewing operational
reports.

## Tech Stack

- React, TypeScript, Vite, Tailwind CSS, and shadcn/ui
- Express.js REST API
- MySQL database with views, triggers, and stored procedures

## Project Structure

```text
CrimeInsight/
├── database/          # Database schema and seed data
├── docs/              # Project documentation and report
├── public/            # Static frontend assets
├── server/            # Express API, authentication, and routes
├── src/               # React frontend source
├── package.json       # Frontend dependencies and scripts
└── README.md
```

Files such as `vite.config.ts`, `tailwind.config.ts`, and the TypeScript
configuration files belong at the repository root and are required by the
frontend toolchain.

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL 8

## Setup

1. Install the frontend dependencies:

   ```sh
   npm install
   ```

2. Install the backend dependencies:

   ```sh
   cd server
   npm install
   cd ..
   ```

3. Create the backend environment file:

   ```sh
   cp server/.env.example server/.env
   ```

4. Update `server/.env` with your local database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=CRIMEINSIGHT
PORT=5001
AUTH_SECRET=replace-with-a-long-random-secret
```

5. Create and seed the database:

```sh
mysql -u <username> -p < database/crimeinsight.sql
```

## Running the Application

Start the backend:

```sh
cd server
npm run dev
```

Start the frontend in another terminal:

```sh
npm run dev
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5001`
- Health check: `http://localhost:5001/api/health`

## Demo Login

The seed data includes:

- Admin: `admin` / `admin123`
- Inspector: `inspector1` / `police123`

These credentials are intended only for local demonstration.

## Verification

```sh
npm run build
npm run lint
npm test
```

## Documentation

- [Project documentation](docs/CRIMEINSIGHT_PROJECT_DOCUMENTATION.md)
- [Project report](docs/CRIMEINSIGHT_PROJECT_REPORT.md)
