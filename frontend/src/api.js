const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function fetchData(endpoint) {
  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { signal: AbortSignal.timeout(10000) });
  } catch (err) {
    if (err.name === "TimeoutError") throw new Error("La solicitud tardó demasiado. Verifica tu conexión.");
    if (err.name === "AbortError") throw new Error("Solicitud cancelada.");
    throw new Error(`Error de conexión con el servidor: ${err.message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}: No se pudo obtener ${endpoint}`);
  }

  try {
    return await res.json();
  } catch (err) {
    throw new Error(`Respuesta inválida del servidor para ${endpoint}`);
  }
}

export const getPersonal = () => fetchData("/personal");
export const getSkills = (category) => fetchData(`/skills${category ? `?category=${category}` : ""}`);
export const getEducation = () => fetchData("/education");
export const getExperience = () => fetchData("/experience");
export const getProjects = (category) => fetchData(`/projects${category ? `?category=${category}` : ""}`);
export const getProject = (id) => fetchData(`/projects/${id}`);
