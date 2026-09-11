# Pulseboard Realtime

![CI](https://github.com/pGabrielM/pulseboard-realtime/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-LISTEN%2FNOTIFY-4169E1?style=flat-square)

A live dashboard that reflects PostgreSQL row changes in the browser in real time — without
polling, and without the client ever querying the database directly.

## Why this project

Most "real-time dashboard" demos poll an API every few seconds. This one uses Postgres'
native **`LISTEN`/`NOTIFY`** instead: the database itself announces the change the instant it
happens, and the server just relays it over a WebSocket. It's a small, deliberately narrow
example of event-driven architecture rather than a CRUD app with a socket bolted on.

## Architecture

```
UPDATE/INSERT on "person"
        │  (AFTER trigger)
        ▼
Postgres: pg_notify('update_notification' | 'insert_notification', row_to_json(new))
        │
        ▼
Node server: pool.query('LISTEN ...') → pool.on('notification', ...)
        │
        ▼
Socket.IO: io.emit(...) → connected browsers
        │
        ▼
React client re-fetches only the affected list (A/B/C, bucketed by first name)
```

- **`db/notify-triggers.sql`**: the two trigger functions (`person_notify_update_trigger`,
  `person_notify_insert_trigger`) and the triggers that fire `pg_notify` after every insert/update
  on `person`. Run this once against your database.
- **`db/seed-mock-data.sql`**: a couple of sample rows to see the flow working end to end.
- **`server/app.js`**: Express + Socket.IO server. Holds a single `pg` connection listening on
  both channels and re-emits each notification to connected sockets; also exposes three plain
  REST endpoints (`/usersA`, `/usersB`, `/usersC`) the client uses for the initial load.
- **`client/`**: Vite + React app that subscribes to the socket and refetches the relevant bucket
  when notified.

## Running locally

```bash
# 1. Apply the schema pieces to your Postgres database
psql "$DATABASE_URL" -f db/notify-triggers.sql
psql "$DATABASE_URL" -f db/seed-mock-data.sql   # optional sample data

# 2. Server
cd server
cp .env.example .env   # set DB_* to your local Postgres
npm install
npm run dev

# 3. Client (in another terminal)
cd client
npm install
npm run dev
```

## CI

Every push/PR to `main` syntax-checks the server and builds the client via
[GitHub Actions](.github/workflows/ci.yml).

## Stack

React, Vite, Socket.IO, Node.js, Express, PostgreSQL (`LISTEN`/`NOTIFY`).
