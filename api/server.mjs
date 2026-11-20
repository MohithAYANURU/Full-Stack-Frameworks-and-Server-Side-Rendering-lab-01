import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const movies = JSON.parse(
  await readFile(path.join(root, "data", "movies.json"), "utf8"),
);
const votes = JSON.parse(
  await readFile(path.join(root, "data", "votes.json"), "utf8"),
);

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(
    `${req.method} ${req.url} (${req.headers["user-agent"] ?? "unknown"})`,
  );
  if (req.method !== "GET") {
    res.writeHead(405);
    res.end("Method Not Allowed");
    return;
  }

  if (req.url === "/api/movies") {
    await delay(1000);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(movies));
    return;
  }

  const movieMatch = req.url?.match(/^\/api\/movies\/(\d+)$/);
  if (movieMatch) {
    await delay(1000);
    const movie = movies.find((item) => item.id === Number(movieMatch[1]));
    if (!movie) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(movie));
    return;
  }

  if (req.url === "/api/votes") {
    await delay(1500);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ votes, countedAt: new Date().toISOString() }));
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(4001, "127.0.0.1", () => {
  console.log("Movie API on http://127.0.0.1:4001/api/movies");
});
