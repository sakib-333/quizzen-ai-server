# Quizzen AI Server

## Setup

Install dependencies, copy `.env.example` to `.env`, and provide the required
Gemini, Convex, and Firebase values. Firebase Admin reads the project ID,
client email, and private key from environment variables; never commit real
service-account credentials.

Generate and synchronize the Convex API and schema during local development:

```bash
npm run convex:dev
```

The generated files in `convex/_generated` are committed so a fresh checkout
can type-check. Regenerate them without starting the Convex watcher with:

```bash
npm run convex:codegen
```

Run the Nest server in development:

```bash
npm run start:dev
```

## Production

Deploy the Convex functions and schema to the deployment configured by the
Convex environment variables, then build and start Nest:

```bash
npm run convex:deploy
npm run build
npm run start:prod
```

For Vercel, configure `CLIENT_URL`, `GEMINI_API_KEY`, `CONVEX_URL`,
`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in
the Production environment. Store `FIREBASE_PRIVATE_KEY` on one line with
newlines escaped as `\n`. Deploy from the committed `package-lock.json` and,
after dependency changes, redeploy without the previous build cache.

Authenticated requests must send a Firebase ID token as
`Authorization: Bearer <token>`. A successful authenticated quiz-generation
request is returned only after the quiz has been written to Convex. Requests
without a token create temporary in-memory guest quizzes.
