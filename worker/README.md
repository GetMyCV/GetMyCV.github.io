# GetMyCv orders Worker

Optional backend for the order form. Deploy it only if you want a real database
and CV uploads; without it the site emails orders through Web3Forms instead.

See the "Where orders go" section of the root README for the full setup. In
short:

```bash
npm install
npx wrangler secret put ADMIN_TOKEN
npx wrangler deploy
```

Then set the repository variable `NEXT_PUBLIC_ORDERS_API` to the deployed URL.

## Why a Worker rather than calling a database directly

A static site cannot keep a secret — anything it holds is readable in the
bundle. The Worker keeps credentials server-side and, just as importantly,
recomputes the order total from its own price table, so a tampered browser
cannot decide what it owes.
