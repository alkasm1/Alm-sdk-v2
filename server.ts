
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const handlers = new Map<string, (request: Record<string, unknown>, ws: WebSocket) => Promise<Record<string, unknown>>>();

handlers.set("system.info", async (request) => ({
  requestId: request.requestId,
  success: true,
  result: { hostname: "termux-device", version: "2.0.0", platform: "Android/Termux" }
}));

handlers.set("system.exec", async (request) => ({
  requestId: request.requestId,
  success: true,
  result: { command: request.payload?.command, output: "Linux termux 6.1.0" }
}));

handlers.set("task.run", async (request, ws) => {
  const taskId = `task_${Date.now()}`;
  
  ws.send(JSON.stringify({
    type: "task.event",
    taskId,
    status: "running",
    timestamp: Date.now()
  }));

  setTimeout(() => {
    ws.send(JSON.stringify({
      type: "task.event",
      taskId,
      status: "completed",
      timestamp: Date.now()
    }));
  }, 5000);

  return {
    requestId: request.requestId,
    success: true,
    result: { taskId, status: "running" }
  };
});

handlers.set("device.discover", async (request) => ({
  requestId: request.requestId,
  success: true,
  result: [
    {
      id: "termux-device",
      hostname: "termux-device",
      platform: "Android/Termux",
      status: "online"
    }
  ]
}));

wss.on("connection", (ws) => {
  console.log("Client connected");

  const eventTimer = setInterval(() => {
    ws.send(JSON.stringify({
      type: "device.event",
      deviceId: "termux-device",
      status: "online",
      timestamp: Date.now()
    }));
  }, 3000);

  ws.on("message", async (data) => {
    try {
      const request = JSON.parse(data.toString());
      const handler = handlers.get(request.opcode);
      
      const response = handler 
        ? await handler(request, ws)
        : { requestId: request.requestId, success: false, error: { code: "UNKNOWN_OPCODE", message: `Unknown: ${request.opcode}` } };
      
      ws.send(JSON.stringify(response));
    } catch (err) {
      console.error("Error:", err);
    }
  });

  ws.on("close", () => clearInterval(eventTimer));
});

console.log("Server: ws://localhost:8080");
EOF

# تأكد من إنشائه
ls -la server.ts
cat server.ts | head -5
