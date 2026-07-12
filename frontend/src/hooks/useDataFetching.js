import { useState, useEffect } from "react";
import { getPersonal, getSkills, getEducation, getExperience, getProjects } from "../api";

export function usePortfolioData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [personal, skills, education, experience, projects] = await Promise.all([
          getPersonal(),
          getSkills(),
          getEducation(),
          getExperience(),
          getProjects(),
        ]);
        if (!cancelled) setData({ personal, skills, education, experience, projects });
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading portfolio data:", err);
          setError(err.message || "Error al cargar datos del portafolio");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
