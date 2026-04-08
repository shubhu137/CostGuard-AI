import express from "express";
import cors from "cors";
import { analyzeCosts, analyzeSecurity, analyzeUsage, buildSummary } from "./analyzers";
import { getScanMeta } from "./liveData";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
  origin: "*", // allow Next.js Vercel app to fetch
}));
app.use(express.json());

app.get("/api/cost", (req, res) => {
  const meta = getScanMeta();
  res.setHeader("X-Scan-Id", meta.scanId);
  res.json({
    success: true,
    data: analyzeCosts(),
    generatedAt: meta.scanTime,
    ...meta,
  });
});

app.get("/api/security", (req, res) => {
  const meta = getScanMeta();
  res.setHeader("X-Scan-Id", meta.scanId);
  res.json({
    success: true,
    data: analyzeSecurity(),
    generatedAt: meta.scanTime,
    ...meta,
  });
});

app.get("/api/usage", (req, res) => {
  const meta = getScanMeta();
  res.setHeader("X-Scan-Id", meta.scanId);
  res.json({
    success: true,
    data: analyzeUsage(),
    generatedAt: meta.scanTime,
    ...meta,
  });
});

app.get("/api/summary", (req, res) => {
  const meta = getScanMeta();
  res.setHeader("X-Scan-Id", meta.scanId);
  res.json({
    success: true,
    data: buildSummary(),
    generatedAt: meta.scanTime,
    ...meta,
  });
});

app.get("/", (req, res) => res.send("CostGuard AI Backend is running."));

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
