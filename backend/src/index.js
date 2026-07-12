import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:4173").split(",").map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
}));

app.use(express.json({ limit: "1mb" }));

app.use("/api", router);

app.get("/", (req, res) => {
  res.json({ message: "Portfolio API — Cristopher Martínez", version: "2.0.0" });
});

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Portfolio API corriendo en http://localhost:${PORT}`);
});
