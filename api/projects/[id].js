import { projects } from "../../backend/src/data.js";
import { setCors, handleOptions } from "../_cors.js";

export default function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  const { id } = req.query;
  const project = projects.find((p) => p.id === Number(id));
  if (!project) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(project);
}
