import axios from "axios";

const API_URL = "http://localhost:3000/api/shapes";

// Verificar si existen figuras (contar figuras)
export const checkShapesExist = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/count`);
    if (response.data.count === 0) {
      console.log("No shapes found. Action aborted.");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking shapes:", error);
    return false;
  }
};