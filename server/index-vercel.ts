import fs from "node:fs";
import path from "node:path";
import express from "express";
import { app } from "./app";
import { registerRoutes } from "./routes";

const distPath = path.resolve(process.cwd(), "dist/public");

// Initialize routes synchronously before export
// This ensures routes are ready when Vercel loads the module
let routesInitialized = false;
let initPromise: Promise<void> | null = null;

function ensureRoutesInitialized(): Promise<void> {
  if (routesInitialized) {
    return Promise.resolve();
  }
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await registerRoutes(app);
        routesInitialized = true;
        console.log("Routes initialized successfully");
      } catch (err) {
        console.error("Failed to initialize routes:", err);
        throw err;
      }
    })();
  }
  
  return initPromise;
}

// Start initialization immediately (non-blocking)
ensureRoutesInitialized().catch(err => {
  console.error("Initial route initialization failed:", err);
});

// Serve static files - allow fallthrough for non-existent files
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { 
    index: false, // Don't auto-serve index.html
    fallthrough: true // Continue to next middleware if file not found
  }));
}

// Serve index.html for all non-API routes (SPA fallback)
app.use("*", async (_req, res) => {
  // Handle API routes
  if (_req.path.startsWith("/api/")) {
    // Ensure routes are initialized before handling API requests
    try {
      await ensureRoutesInitialized();
    } catch (err) {
      console.error("Routes not initialized:", err);
      return res.status(500).send("Internal server error");
    }
    // Let the API routes handle it (they're already registered)
    return;
  }
  
  // Ensure routes are initialized
  try {
    await ensureRoutesInitialized();
  } catch (err) {
    console.error("Routes initialization error:", err);
    return res.status(500).send("Internal server error");
  }
  
  try {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.setHeader("Content-Type", "text/html");
      res.sendFile(indexPath);
    } else {
      console.error("index.html not found at:", indexPath);
      res.status(404).send("Not found");
    }
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).send("Internal server error");
  }
});

// Export for Vercel serverless
export default app;

