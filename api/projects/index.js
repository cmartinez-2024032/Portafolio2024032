import { projects } from "../../backend/src/data.js";
import { setCors, handleOptions } from "../_cors.js";

export default function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  const { category, featured } = req.query;
  let result = [...projects];
  if (category && category !== "todos") {
    result = result.filter((p) => p.category === category);
  }
  if (featured === "true") {
    result = result.filter((p) => p.featured);
  }

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(result);
}
