import { experience } from "../backend/src/data.js";
import { setCors, handleOptions } from "./_cors.js";

export default function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(experience);
}
