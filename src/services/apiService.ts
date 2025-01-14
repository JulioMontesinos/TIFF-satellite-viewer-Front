import axios from "axios";

const API_URL = "http://localhost:3000/api/shapes";
const AUTH_URL = "http://localhost:3000/api/auth/token";

let token: string = "";

// Obtener el token dinámico
export const fetchToken = async (): Promise<string> => {
  if (token) return token; // Si el token ya existe, retornarlo directamente

  try {
    const response = await axios.get(AUTH_URL);
    token = response.data.token || ""; // Asegurarte de que no sea null
    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw new Error("Failed to fetch token");
  }
};

// Obtener todos los shapes
export const getShapes = async () => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Crear un nuevo shape
export const createShape = async (shape: { type: string; coordinates: number[][]; userId?: string }) => {
  const response = await axios.post(API_URL, shape, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Eliminar un shape
export const deleteShape = async (id: string) => { 
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Eliminar todos los shapes
export const deleteAllShapes = async () => {
  const response = await axios.delete(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }); // Realiza una petición DELETE a la raíz
  return response.data;
};

export const updateShape = async (id: string, data: { coordinates: number[][] }) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};