const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes/routing");
const { v4: uuidv4 } = require("uuid");
const consul = require("consul")();
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
require("dotenv").config();

const requestLogger = require("./utilities/requestLogger");
const errorLogger = require("./utilities/errorLogger");
const connectDB = require("./config/db.config");

const app = express();

// Database connection
connectDB();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(requestLogger);

// Swagger documentation
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use("/cart-api", routes);
app.use(errorLogger);

// Health Check Endpoint for Consul
app.get("/health", (req, res) => {
  res.status(200).send("Service is healthy");
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Error: ", err.stack); // Log error with stack trace
  res.status(500).json({ message: err.message });
});

// Server initialization
const hostname = process.env.CONSUL_HOST || "127.0.0.1";
const port = process.env.NODE_PORT || 3003;

const server = app.listen(port, hostname, () => {
  console.log(`Cart Service running at http://${hostname}:${port}/`);
});

// Register service with Consul
const Cid = uuidv4();
const CONSUL_ID = process.env.CONSUL_SERVICE_NAME || "cart-service";
const myService = {
  name: CONSUL_ID,
  address: hostname,
  port: port,
  id: Cid,
  check: {
    http: `http://${hostname}:${port}/health`,
    interval: "10s",
    deregister_critical_service_after: "1m",
  },
};

consul.agent.service.register(myService, (err) => {
  if (err) {
    console.error("Consul registration failed:", err);
    return;
  }
  console.log("Service registered with Consul");

  setInterval(() => {
    consul.agent.check.pass({ id: `service:${Cid}` }, (err) => {
      if (err) {
        console.error("Consul health update failed:", err);
        return;
      }
      console.log("Consul health status updated");
    });
  }, 8 * 1000);
});

// Graceful shutdown for Consul deregistration
process.on("SIGINT", () => {
  consul.agent.service.deregister(Cid, (err) => {
    if (err) {
      console.error("Failed to deregister service from Consul:", err);
    } else {
      console.log("Service deregistered from Consul");
    }
    server.close(() => {
      console.log("Server closed gracefully");
      process.exit();
    });
  });
});
