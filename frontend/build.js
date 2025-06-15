const fs = require("fs");
const path = require("path");
const pkg = require("./package.json");

// prepare dist directories
fs.mkdirSync(path.join(__dirname, "dist", "js"), { recursive: true });

// Read and process HTML
const srcHtmlPath = path.join(__dirname, "src", "index.html");
let html = fs.readFileSync(srcHtmlPath, "utf8");
html = html.replace("{{VERSION}}", pkg.version);

// Add API base URL from environment variable if available
const apiBaseUrl = process.env.API_BASE_URL || "";
if (apiBaseUrl) {
  // Add a script tag to set the API_BASE_URL global variable
  const scriptTag = `<script>window.API_BASE_URL = "${apiBaseUrl}";</script>`;
  html = html.replace("</head>", `${scriptTag}\n</head>`);
}

const distHtmlPath = path.join(__dirname, "dist", "index.html");
fs.writeFileSync(distHtmlPath, html);

// Copy JS files
const srcJsDir = path.join(__dirname, "src", "js");
const distJsDir = path.join(__dirname, "dist", "js");
fs.readdirSync(srcJsDir).forEach((file) => {
  fs.copyFileSync(path.join(srcJsDir, file), path.join(distJsDir, file));
});
