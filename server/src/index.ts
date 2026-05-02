import express from "express"
import { connectDB, disconnectDB, getConnectionStatus } from "@/lib/db"
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler"

// Import routes
import authRoutes from "@/routes/auth"
import userRoutes from "@/routes/users"
import skillRoutes from "@/routes/skills"
import verificationRoutes from "@/routes/verifications"

const app = express()
const port = process.env.PORT || 8080

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

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
    console.log("✓ MongoDB connection established")

    // Start Express server
    app.listen(port, () => {
      console.log(`✓ Server listening on port ${port}...`)
      console.log(`\n📚 API Endpoints:`)
      console.log(`  Users: POST/GET/PATCH/DELETE /api/users/:id`)
      console.log(`  Skills: POST/GET/PATCH/DELETE /api/skills/:id`)
      console.log(`  Collections: POST/GET/PATCH/DELETE /api/collections/:id`)
      console.log(
        `  Verifications: POST/GET/PATCH/DELETE /api/verifications/:id`
      )
      console.log(`  Health: GET /health\n`)
    })
  } catch (error) {
    console.error("✗ Failed to start server:", error)
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
