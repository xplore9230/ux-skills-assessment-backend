import fs from "node:fs";
import path from "node:path";
import express from "express";
import { app } from "./app";
import { registerRoutes } from "./routes";

// Serve static files
const distPath = path.resolve(process.cwd(), "dist/public");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Create a handler that ensures routes are initialized
let routesPromise: Promise<void> | null = null;

const getRoutesPromise = (): Promise<void> => {
  if (!routesPromise) {
    routesPromise = registerRoutes(app)
      .then(() => {
        // Routes initialized successfully
      })
      .catch((err) => {
        console.error("Failed to initialize routes:", err);
        routesPromise = null; // Reset on error
        throw err;
      });
  }
  return routesPromise;
};

// Start initialization immediately
getRoutesPromise().catch(() => {
  // Error logged above, will retry on next request
});

// Serve index.html for all other routes (SPA fallback)
app.use("*", async (_req, res) => {
  try {
    // Ensure routes are initialized
    await getRoutesPromise();
    
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Not found");
    }
  } catch (error) {
    console.error("Error in request handler:", error);
    res.status(500).send("Internal server error");
  }
});

// Export for Vercel serverless
export default app;

