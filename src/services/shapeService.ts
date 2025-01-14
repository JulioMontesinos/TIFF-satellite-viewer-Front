import axios from "axios";
import { fetchToken } from "./apiService";

const API_URL = "http://localhost:3000/api/shapes";
const token = await fetchToken();

// Verificar si existen figuras (contar figuras)
export const checkShapesExist = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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