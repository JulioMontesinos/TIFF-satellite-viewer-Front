import axios from "axios";
import { fetchToken } from "./apiService";

const token = await fetchToken();
const API_URL = import.meta.env.VITE_API_URL;

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