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
  setOriginalFeatures,
}) => {
  const clearAll = async () => {
    showConfirmMessage(
      "Are you sure you want to delete all shapes? This action cannot be undone.",
      async () => {
        try {
          // Call the API to delete all shapes
          const response = await deleteAllShapes();
          // Safety validation: check if the response is successful
          if (response.success) {
            // Clear shapes from the map
            if (vectorLayer && vectorLayer.getSource()) {
              vectorLayer.getSource()?.clear();
              // Update originalFeatures
              syncOriginalFeatures(vectorLayer.getSource()!, (features) => {
                setOriginalFeatures(features);
              });
            } else {
              console.warn("VectorLayer or source is not available. Cannot sync original features.");
            }
          } else {
            showSimpleMessage("Error deleting all shapes", "error");
            throw new Error("API response indicates failure");
          }
        } catch (error) {
          console.error("Error deleting all shapes:", error);
          showSimpleMessage("Error deleting all shapes", "error");
        }

        // End interaction
        onClick();
      },
      () => {
        // Action if the operation is canceled
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
  };

  return (
    <button className="clearAll-button" onClick={handleClick}>
      Clear All
    </button>
  );
};

export default ClearAllTool;