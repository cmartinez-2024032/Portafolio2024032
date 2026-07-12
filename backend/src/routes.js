import { Router } from "express";
import { personal, skills, education, experience, projects } from "./data.js";

const router = Router();

router.get("/personal", (req, res) => res.json(personal));

router.get("/skills", (req, res) => {
  const { category } = req.query;
  let result = skills;
  if (category) {
    result = skills.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }
  res.json(result);
});

router.get("/education", (req, res) => res.json(education));

router.get("/experience", (req, res) => res.json(experience));

router.get("/projects", (req, res) => {
  const { category, featured } = req.query;
  let result = [...projects];
  if (category && category !== "todos") {
    result = result.filter((p) => p.category === category);
  }
  if (featured === "true") {
    result = result.filter((p) => p.featured);
  }
  res.json(result);
});

router.get("/projects/:id", (req, res) => {
  const project = projects.find((p) => p.id === Number(req.params.id));
  if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });
  res.json(project);
});

export default router;
