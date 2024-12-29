const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes/routing");
const Cid = require("uuid").v4();
const consul = require("consul")();
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

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
    "Access-Control-Allow-Origin": "*",
  })
);
app.use(express.json());
app.use(requestLogger);

// Swagger documentation
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use("/customer-api", routes);
app.use(errorLogger);

// Error handler middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

// Server initialization
const hostname = "127.0.0.1";
const port = process.env.NODE_PORT || 3001;

app.listen(port, hostname, () => {
  console.log(`Customer Service running at http://${hostname}:${port}/`);
});

// Register service with Consul
const CONSUL_ID = "customer-service";
const myService = {
  name: CONSUL_ID,
  address: hostname,
  port: port,
  id: Cid,
  check: {
    ttl: "20s",
    deregister_critical_service_after: "1m",
  },
};

consul.agent.service.register(myService, (err) => {
  setInterval(() => {
    consul.agent.check.pass({ id: `service:${Cid}` }, (err) => {
      if (err) throw new Error(err);
      console.log("Updated Consul - Health Status");
    });
  }, 8 * 1000);
});
