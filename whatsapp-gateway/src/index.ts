import { createHmac, timingSafeEqual } from "node:crypto";
import path from "node:path";
import Fastify from "fastify";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WAMessage,
  type WASocket,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";

const port = Number(process.env.PORT || 3001);
const gatewayToken = requireEnv("WHATSAPP_GATEWAY_TOKEN");
const authDir = process.env.BAILEYS_AUTH_DIR || path.resolve("auth");
const inboundWebhookUrl = process.env.INBOUND_WEBHOOK_URL;
const inboundWebhookSecret = process.env.INBOUND_WEBHOOK_SECRET;

let socket: WASocket | null = null;
let latestQr: string | null = null;
let connectionState: "connecting" | "open" | "closed" = "connecting";
let reconnectTimer: NodeJS.Timeout | null = null;

const app = Fastify({ logger: true });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function isAuthorized(authorization: string | undefined): boolean {
  const supplied = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expectedBuffer = Buffer.from(gatewayToken);
  const suppliedBuffer = Buffer.from(supplied);
  return suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function authorize(authorization: string | undefined): void {
  if (!isAuthorized(authorization)) {
    const error = new Error("Unauthorized");
    Object.assign(error, { statusCode: 401 });
    throw error;
  }
}

function normalizeJid(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.startsWith("0")) {
    throw new Error("Use a full phone number including country code.");
  }
  return `${digits}@s.whatsapp.net`;
}

function textFrom(message: WAMessage): string | null {
  return message.message?.conversation ||
    message.message?.extendedTextMessage?.text ||
    null;
}

async function forwardInboundMessage(message: WAMessage): Promise<void> {
  if (!inboundWebhookUrl || !inboundWebhookSecret || message.key.fromMe) return;
  const text = textFrom(message);
  const from = message.key.remoteJid;
  if (!text || !from || from === "status@broadcast") return;

  const payload = JSON.stringify({
    from,
    messageId: message.key.id,
    text,
    receivedAt: new Date().toISOString(),
  });
  const signature = createHmac("sha256", inboundWebhookSecret)
    .update(payload)
    .digest("hex");

  try {
    const response = await fetch(inboundWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-asanib-whatsapp-signature": `sha256=${signature}`,
      },
      body: payload,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) app.log.warn({ status: response.status }, "Inbound webhook rejected");
  } catch (error) {
    app.log.warn({ error }, "Could not forward inbound WhatsApp message");
  }
}

async function connect(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  connectionState = "connecting";
  const nextSocket = makeWASocket({
    auth: state,
    version,
    browser: Browsers.ubuntu("Asanib WhatsApp"),
    markOnlineOnConnect: false,
    printQRInTerminal: false,
  });
  socket = nextSocket;

  nextSocket.ev.on("creds.update", saveCreds);
  nextSocket.ev.on("messages.upsert", ({ messages, type }) => {
    if (type !== "notify") return;
    for (const message of messages) void forwardInboundMessage(message);
  });
  nextSocket.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) latestQr = qr;
    if (connection === "open") {
      connectionState = "open";
      latestQr = null;
      app.log.info("WhatsApp connection opened");
      return;
    }
    if (connection !== "close") return;

    connectionState = "closed";
    socket = null;
    const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)
      ?.output?.statusCode;
    if (statusCode === DisconnectReason.loggedOut) {
      latestQr = null;
      app.log.warn("WhatsApp session logged out; pair again from /session");
      return;
    }
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect().catch((error) => app.log.error({ error }, "WhatsApp reconnection failed"));
    }, 1_000);
  });
}

app.get("/health", async () => ({
  status: connectionState,
  connected: connectionState === "open",
}));

app.get("/session", async (request) => {
  authorize(request.headers.authorization);
  return {
    connected: connectionState === "open",
    qrDataUrl: latestQr ? await QRCode.toDataURL(latestQr) : null,
    pairingRequired: connectionState !== "open" && Boolean(latestQr),
  };
});

app.post("/messages", async (request, reply) => {
  authorize(request.headers.authorization);
  const body = request.body as { to?: unknown; text?: unknown; orderId?: unknown };
  if (typeof body?.to !== "string" || typeof body?.text !== "string") {
    return reply.code(400).send({ error: "to and text are required." });
  }
  const text = body.text.trim();
  if (!text || text.length > 4_096) {
    return reply.code(400).send({ error: "text must be between 1 and 4096 characters." });
  }
  if (!socket || connectionState !== "open") {
    return reply.code(503).send({ error: "WhatsApp is not connected." });
  }

  const result = await socket.sendMessage(normalizeJid(body.to), { text });
  return reply.code(202).send({
    accepted: true,
    messageId: result?.key.id || null,
    orderId: typeof body.orderId === "string" ? body.orderId : null,
  });
});

await connect();
await app.listen({ host: "0.0.0.0", port });
