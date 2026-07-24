import { skills } from "../backend/src/data.js";
import { setCors, handleOptions } from "./_cors.js";

export default function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  const { category } = req.query;
  let result = skills;
  if (category) {
    result = skills.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(result);
}
