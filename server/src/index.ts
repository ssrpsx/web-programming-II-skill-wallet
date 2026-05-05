import express from "express"
import { connectDB, disconnectDB, getConnectionStatus } from "./lib/db"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler"

// Import routes
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import skillRoutes from "./routes/skills"
import verificationRoutes from "./routes/verifications"

import { runSeed } from "./seed-test-users";

const app = express()
const port = process.env.PORT || 8080

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Basic CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/skills", skillRoutes)
app.use("/api/verifications", verificationRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb: getConnectionStatus(),
  })
})

app.get("/", (req, res) => {
  res.send("Hello World! API running with MongoDB")
})

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server with MongoDB connection
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB()
    console.log("✓ MongoDB connection established");

    // Start Express server
    app.listen(port, "0.0.0.0", () => {
      console.log(`✓ Server listening on port ${port} and address 0.0.0.0`);
      
      // Seed database if requested
      if (process.env.AUTO_SEED === "true") {
        console.log("Starting auto-seeding...");
        runSeed(false)
          .then(() => console.log("✓ Database auto-seeded"))
          .catch((err) => console.error(`✗ Database auto-seeding failed: ${err.message}`));
      }

      console.log(`\n📚 API Endpoints available at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error(`✗ Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...")
  await disconnectDB()
  process.exit(0)
})

startServer()
