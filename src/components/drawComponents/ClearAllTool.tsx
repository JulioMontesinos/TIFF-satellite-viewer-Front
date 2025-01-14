import React from "react";
import VectorLayer from "ol/layer/Vector";
import { deleteAllShapes } from "../../services/apiService"; // Nueva función para eliminar todos los shapes
import { checkShapesExist } from "../../services/shapeService";
import { syncOriginalFeatures } from "../utils/shapeSyncService";
import Feature from "ol/Feature";
import "../../styles/clearAllTool.css";

interface ClearAllToolProps {
  vectorLayer: VectorLayer | null;
  onClick: () => void;
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful" | "confirm") => void;
  showConfirmMessage: (
    msg: string,
    onAccept: () => void,
    onReject?: () => void
  ) => void;
  setOriginalFeatures: (features: Feature[]) => void;
}

const ClearAllTool: React.FC<ClearAllToolProps> = ({ 
  vectorLayer, 
  onClick, 
  showSimpleMessage, 
  showConfirmMessage, 
  setOriginalFeatures 
}) => {
  const clearAll = async () => {
    
    showConfirmMessage(
      "Are you sure you want to delete all shapes? This action cannot be undone.",
      async () => {
        try {
          // Llama a la API para eliminar todos los shapes
          const response = await deleteAllShapes();
          // Validación de seguridad: verifica que la respuesta sea exitosa
          if (response.success) {
            // Limpia las figuras del mapa
            if (vectorLayer && vectorLayer.getSource()) {
              vectorLayer.getSource()?.clear();
              // Actualiza las originalFeatures
              syncOriginalFeatures(vectorLayer.getSource()!, (features) => {
                setOriginalFeatures(features);
              });
            }else {
              console.warn("VectorLayer or source is not available. Cannot discard changes.");
            }

          } else {
            showSimpleMessage("Error deleting all shapes", "error");
            throw new Error("API response indicates failure");
          }
        } catch (error) {
          console.error("Error deleting all shapes:", error);
          showSimpleMessage("Error deleting all shapes", "error");
        }

        // Finaliza la interacción
        onClick();
      },
      () => {
        // Acción si se cancela la operación
        showSimpleMessage("Clear all operation canceled", "confirm");
      }
    );
  };

  const handleClick = async () => {
    const shapesExist = await checkShapesExist();
    if (!shapesExist) {
      showSimpleMessage("No shapes to clear", "warning");
      return;
    }
    clearAll();
  }

  return (
    <button className="clearAll-button" onClick={handleClick}>
      Clear All
    </button>
  );
};

export default ClearAllTool;