import axios from "axios";
import { fetchToken } from "./apiService";

const API_URL = import.meta.env.VITE_API_URL;

// Encapsula el token en una función que se pueda llamar cuando sea necesario
let token: string | null = null;

const getToken = async (): Promise<string> => {
  if (!token) {
    token = await fetchToken(); // Solo llama a fetchToken una vez
  }
  return token;
};

export const checkShapesExist = async (): Promise<boolean> => {
  try {
    const token = await getToken(); // Obtiene el token dinámicamente
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