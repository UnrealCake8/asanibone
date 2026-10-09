# Asanib WhatsApp gateway

A standalone Baileys service for your Mac. It is not part of the Next.js/Vercel deployment.

## Run locally

```bash
cd whatsapp-gateway
cp .env.example .env
# Set WHATSAPP_GATEWAY_TOKEN to a long random value.
npm install
npm run start
```

Open `http://localhost:3001/session` with an authenticated request to retrieve the pairing QR data URL. Scan it from WhatsApp: **Linked devices → Link a device**.

The authentication session is stored in `BAILEYS_AUTH_DIR` (default: `./auth`). Keep that folder private and backed up; deleting it requires pairing again.

## Authenticated API

All routes except `GET /health` require:

```
Authorization: Bearer <WHATSAPP_GATEWAY_TOKEN>
```

- `GET /health`: connection state.
- `GET /session`: connection state and a QR data URL while pairing is required.
- `POST /messages`: send a customer update.

```json
{ "to": "+971585235595", "text": "Your Asanib order is on its way.", "orderId": "optional" }
```

Phone numbers must include their country code. The gateway never exposes the stored WhatsApp session through its API.

## Security

Run this only on a trusted Mac/network. Do not expose port 3001 publicly without a reverse proxy, HTTPS, and firewall rules. The optional inbound webhook is HMAC-signed with `INBOUND_WEBHOOK_SECRET`.
