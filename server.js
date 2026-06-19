// server.js

import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 8080
});

/**
 * Runtime Opcode Handlers
 */
const handlers = new Map();

/**
 * Active tasks
 */
const tasks = new Map();

// =========================
// system.info
// =========================
handlers.set("system.info", async (request) => {
  return {
    requestId: request.requestId,
    success: true,
    result: {
      hostname: request.deviceId,
      version: "0.1.0",
      platform: "Xx28 Runtime"
    }
  };
});

// =========================
// system.exec
// =========================
handlers.set("system.exec", async (request) => {
  return {
    requestId: request.requestId,
    success: true,
    result: {
      command: request.payload?.command,
      output: "Linux router-1 6.1.0"
    }
  };
});

// =========================
// task.run
// =========================
handlers.set("task.run", async (request, ws) => {
  const taskId =
    `task_${Date.now()}`;

  tasks.set(taskId, {
    taskId,
    task: request.payload?.task,
    status: "running"
  });

  // task started event
  ws.send(
    JSON.stringify({
      type: "task.event",
      taskId,
      status: "running",
      timestamp: Date.now()
    })
  );

  // simulate completion
  setTimeout(() => {
    const task = tasks.get(taskId);

    if (!task) {
      return;
    }

    task.status = "completed";

    if (ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          type: "task.event",
          taskId,
          status: "completed",
          timestamp: Date.now()
        })
      );
    }
  }, 5000);

  return {
    requestId: request.requestId,
    success: true,
    result: {
      taskId,
      status: "running"
    }
  };
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  // =========================
// device.discover
// =========================
handlers.set(
  "device.discover",
  async (request) => {
    return {
      requestId: request.requestId,
      success: true,
      result: [
        {
          id: "router-1",
          hostname: "router-1",
          platform: "Xx28 Runtime",
          status: "online"
        }
      ]
    };
  }
);
  // =========================
  // Device heartbeat events
  // =========================
  const eventTimer = setInterval(() => {
    if (ws.readyState !== ws.OPEN) {
      return;
    }

    ws.send(
      JSON.stringify({
        type: "device.event",
        deviceId: "router-1",
        status: "online",
        timestamp: Date.now()
      })
    );
  }, 3000);

  ws.on("message", async (data) => {
    try {
      const request =
        JSON.parse(data.toString());

      console.log(
        "Request:",
        request
      );

      const handler =
        handlers.get(request.opcode);

      let response;

      if (handler) {
        response =
          await handler(request, ws);
      } else {
        response = {
          requestId: request.requestId,
          success: false,
          error: {
            code: "UNKNOWN_OPCODE",
            message:
              `Unknown opcode: ${request.opcode}`
          }
        };
      }

      ws.send(
        JSON.stringify(response)
      );
    } catch (err) {
      console.error(
        "Request processing error:",
        err
      );
    }
  });

  ws.on("close", () => {
    clearInterval(eventTimer);

    console.log(
      "Client disconnected"
    );
  });
});

console.log(
  "Listening on ws://localhost:8080"
);
