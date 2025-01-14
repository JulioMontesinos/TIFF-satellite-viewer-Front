import axios from "axios";

let token: string = "";
const API_URL = import.meta.env.VITE_API_URL;
const AUTH_URL = import.meta.env.VITE_AUTH_URL;

// Fetch the dynamic token
export const fetchToken = async (): Promise<string> => {
  if (token) return token; // If the token already exists, return it directly

  try {
    const response = await axios.get(AUTH_URL);
    token = response.data.token || "";
    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw new Error("Failed to fetch token");
  }
};

// Fetch all shapes
export const getShapes = async () => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Create a new shape
export const createShape = async (shape: { type: string; coordinates: number[][]; userId?: string }) => {
  const response = await axios.post(API_URL, shape, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Delete a shape
export const deleteShape = async (id: string) => { 
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Delete all shapes
export const deleteAllShapes = async () => {
  const response = await axios.delete(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }); // Performs a DELETE request to the root
  return response.data;
};

// Update a shape
export const updateShape = async (id: string, data: { coordinates: number[][] }) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};