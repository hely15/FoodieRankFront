const http = require("http")
const fs = require("fs")
const path = require("path")
const url = require("url")

const PORT = process.env.PORT || 3001

// MIME types for different file extensions
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
}

// Function to serve static files
function serveStaticFile(filePath, res) {
  const extname = path.extname(filePath).toLowerCase()
  const contentType = mimeTypes[extname] || "application/octet-stream"

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(__dirname, "public", "index.html"), (err, content) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" })
            res.end("Error interno del servidor")
          } else {
            res.writeHead(200, {
              "Content-Type": "text/html",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            })
            res.end(content)
          }
        })
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" })
        res.end("Error interno del servidor")
      }
    } else {
      res.writeHead(200, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      })
      res.end(content)
    }
  })
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const pathname = parsedUrl.pathname

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    })
    res.end()
    return
  }

  // Health check endpoint
  if (pathname === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    })
    res.end(
      JSON.stringify({
        status: "OK",
        message: "FoodieRank Frontend Server is running",
        timestamp: new Date().toISOString(),
        port: PORT,
      }),
    )
    return
  }

  // Serve static files
  const filePath = path.join(__dirname, "public", pathname === "/" ? "index.html" : pathname)

  // Security check - prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname, "public"))) {
    res.writeHead(403, { "Content-Type": "text/plain" })
    res.end("Forbidden")
    return
  }

  serveStaticFile(filePath, res)
})

// Start server
server.listen(PORT, () => {
  console.log(`
    🍽️  FoodieRank Frontend Server
    ================================
    🚀 Server running on: http://localhost:${PORT}
    📁 Serving files from: ${path.join(__dirname, "public")}
    🔗 API Backend URL: http://localhost:3000/api/v1
    ⚡ Environment: ${process.env.NODE_ENV || "development"}
    ================================
    `)
})

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server")
  server.close(() => {
    console.log("HTTP server closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server")
  server.close(() => {
    console.log("HTTP server closed")
    process.exit(0)
  })
})

module.exports = server
