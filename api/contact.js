import { setCors, handleOptions } from "./_cors.js";
import { handleContact } from "../backend/src/contact.js";

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await handleContact(req, res);
}
