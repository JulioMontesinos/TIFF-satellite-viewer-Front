import React from "react";
import VectorLayer from "ol/layer/Vector";
import { deleteAllShapes } from "../../services/apiService"; // Nueva función para eliminar todos los shapes
import "../../styles/clearAllTool.css";

interface ClearAllToolProps {
  vectorLayer: VectorLayer | null;
  onClick: () => void;
}

const ClearAllTool: React.FC<ClearAllToolProps> = ({ vectorLayer, onClick }) => {
  const clearAll = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to delete all shapes? This action cannot be undone."
    );

    if (!confirmClear) return;

    try {
      // Llama a la API para eliminar todos los shapes
      await deleteAllShapes();

      // Limpia las figuras del mapa
      vectorLayer?.getSource()?.clear();
      console.log("All shapes cleared from the database and map.");
    } catch (error) {
      console.error("Error clearing all shapes:", error);
    }

    onClick();
  };

  return (
    <button className="clearAll-button" onClick={clearAll}>
      Clear All
    </button>
  );
};

export default ClearAllTool;