import axios from "axios";

const API_URL = "http://localhost:3000/api/shapes"; // URL base del backend

// Obtener todos los shapes
export const getShapes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Crear un nuevo shape
export const createShape = async (shape: { type: string; coordinates: number[][]; userId?: string }) => {
  const response = await axios.post(API_URL, shape);
  return response.data;
};

// Eliminar un shape
export const deleteShape = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};