import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  const assetsPath = path.join(staticPath, "assets");

  app.use(
    ["/assets", "/network-topology-trainer/assets"],
    express.static(assetsPath, { fallthrough: false })
  );

  app.use(express.static(staticPath));
  app.use("/network-topology-trainer", express.static(staticPath));

  // Redirect root to base path in production to match GitHub Pages behavior
  if (process.env.NODE_ENV === "production") {
    app.get("/", (_req, res) => {
      res.redirect("/network-topology-trainer/");
    });
  }

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const preferredPort = Number(process.env.PORT) || 3000;

  const listen = async (port: number) => {
    await new Promise<void>((resolve, reject) => {
      const onError = (err: NodeJS.ErrnoException) => {
        server.off("listening", onListening);
        reject(err);
      };

      const onListening = () => {
        server.off("error", onError);
        resolve();
      };

      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(port);
    });
  };

  let port = preferredPort;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      await listen(port);
      break;
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code === "EADDRINUSE") {
        port += 1;
        continue;
      }
      throw err;
    }
  }

  console.log(`Server running on http://localhost:${port}/`);
}

startServer().catch(console.error);
