const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const MAPPLS_API_KEY = "apbjiwyfjavgdpjfgkhtwfkwjtuaigtscyvu";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".sql": "text/plain; charset=utf-8"
};

// Handle Mappls API requests via backend proxy
function handleMapplsProxy(res, query) {
  const location = query.location || "28.6139,77.2090"; // Default to Delhi
  const keyword = query.keyword || "restaurant";
  
  const mapplsUrl = `https://apis.mappls.com/advancedmaps/v1/place_search/nearby?location=${location}&keyword=${keyword}&radius=5000&limit=12&key=${MAPPLS_API_KEY}`;
  
  https.get(mapplsUrl, (mapplsRes) => {
    let data = "";
    mapplsRes.on("data", chunk => data += chunk);
    mapplsRes.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
  }).on("error", (err) => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Mappls API error", details: err.message }));
  });
}

http
  .createServer((req, res) => {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // Handle API proxy
    if (req.url.startsWith("/api/restaurants")) {
      const query = url.parse(req.url, true).query;
      handleMapplsProxy(res, query);
      return;
    }

    let requestPath = decodeURIComponent(req.url.split("?")[0]);
    if (requestPath === "/") requestPath = "/index.html";

    const filePath = path.normalize(path.join(root, requestPath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
      });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`🚀 DineMate running on http://127.0.0.1:${port}`);
    console.log(`📍 Mappls API proxy enabled`);
  });
