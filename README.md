# envlayer

Lightweight library for layered environment variable resolution with schema validation.

## Installation

```bash
npm install envlayer
```

## Usage

```typescript
import { createEnv } from 'envlayer';

const env = createEnv({
  schema: {
    PORT: { type: 'number', default: 3000 },
    DATABASE_URL: { type: 'string', required: true },
    DEBUG: { type: 'boolean', default: false },
  },
  layers: [
    { source: 'defaults' },
    { source: 'file', path: '.env' },
    { source: 'process' },
  ],
});

console.log(env.PORT);         // 3000
console.log(env.DATABASE_URL); // resolved from .env or process.env
console.log(env.DEBUG);        // false
```

Variables are resolved in layer order — later layers take precedence. If a required variable is missing or a value fails type validation, `createEnv` throws a descriptive error at startup.

## Features

- 🔗 **Layered resolution** — combine defaults, `.env` files, and `process.env`
- ✅ **Schema validation** — catch missing or malformed variables early
- 🔒 **Type-safe** — fully typed output based on your schema definition
- 🪶 **Zero dependencies** — minimal footprint

## License

[MIT](./LICENSE)