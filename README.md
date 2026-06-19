# ALM SDK v2.0

[![npm version](https://badge.fury.io/js/alm-sdk.svg)](https://www.npmjs.com/package/alm-sdk)
[![CI](https://github.com/your-org/alm-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/alm-sdk/actions)
[![Coverage](https://img.shields.io/codecov/c/github/your-org/alm-sdk)](https://codecov.io/gh/your-org/alm-sdk)

> **Event Sourcing Client SDK** for real-time system orchestration over WebSocket

## ✨ Features

- ⚡ **Real-time WebSocket** communication with auto-reconnection
- 🔄 **Event Sourcing** with built-in Event Store and Replay Engine
- 🛡️ **HMAC-SHA256** request signing with replay attack protection
- 🔐 **AES-256-GCM** encryption layer (optional)
- 🧩 **Middleware Pipeline** (Express-like)
- 📦 **Task & Device** state management with lifecycle tracking
- 🔒 **Full TypeScript** support with strict type safety
- 🧪 **100% Test Coverage** target
- 📊 **Built-in metrics** and performance monitoring

## 📦 Installation

```bash
npm install alm-sdk
```

## 🚀 Quick Start

```typescript
import { ALMClient } from 'alm-sdk';

const client = new ALMClient({
  endpoint: 'ws://localhost:8080',
  secret: 'your-secret-key-min-32-chars',
});

await client.connect();

// Device operations
const device = client.devices.get('router-1');
const info = await device.info();

// Task execution
const task = await client.tasks.run('router-1', 'backup-config');

// Event listening
client.on('device.event', (event) => {
  console.log('Device status:', event.status);
});

client.on('task.event', (event) => {
  console.log('Task status:', event.status);
});

// Replay events
const events = client.replay(Date.now() - 3600000); // Last hour
```

## 📖 Documentation

- [API Reference](https://alm-sdk.dev/api)
- [Architecture Guide](https://alm-sdk.dev/architecture)
- [Security Guide](https://alm-sdk.dev/security)
- [Examples](https://alm-sdk.dev/examples)

## 🔒 Security

ALM SDK uses industry-standard security:

- **HMAC-SHA256** for request signing
- **Timestamp-based** expiration
- **Nonce-based** replay attack protection
- **AES-256-GCM** optional encryption layer

## 📄 License

MIT
