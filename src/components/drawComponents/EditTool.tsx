import React, { useState } from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Modify from "ol/interaction/Modify";
import VectorSource from "ol/source/Vector";
import Polygon from "ol/geom/Polygon";
import Feature from "ol/Feature";
import { updateShape } from "../../services/apiService"; // Crear esta función para actualizar el backend
import { checkShapesExist } from "../../services/shapeService";
import { syncOriginalFeatures } from "../utils/shapeSyncService";
import "../../styles/editTool.css";

interface EditToolProps {
  map: Map | null;
  vectorLayer: VectorLayer<VectorSource> | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  onSaveComplete: () => void;
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful") => void;
  showConfirmMessage: (
    msg: string,
    onAccept: () => void,
    onReject?: () => void
  ) => void;
  setOriginalFeatures: (features: Feature[]) => void;
}

const EditTool: React.FC<EditToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  onSaveComplete,
  showSimpleMessage,
  showConfirmMessage,
  setOriginalFeatures
}) => {
  const [modifiedFeatures, setModifiedFeatures] = useState<any[]>([]);

  const addModifyInteraction = () => {
    if (!map || !vectorLayer || !vectorLayer.getSource()) return;
  
    const modifyInteraction = new Modify({
      source: vectorLayer.getSource()!,
    });
  
    modifyInteraction.on("modifyend", (event) => {
      const modified = event.features.getArray();
  
      setModifiedFeatures((prevFeatures) => {
        // Add newly modified features, avoiding duplicates
        const updatedFeatures = [...prevFeatures];
        modified.forEach((feature) => {
          if (!updatedFeatures.some((f) => f === feature)) {
            updatedFeatures.push(feature);
          }
        });
        return updatedFeatures;
      });
    });
  
    map.addInteraction(modifyInteraction);
  };
  
  const handleSaveChanges = async () => {
    try {
      for (const feature of modifiedFeatures) {
        const geometry = feature.getGeometry();
        const shapeId = feature.getId();
  
        if (!shapeId) {
          console.warn("Feature does not have an ID:", feature);
          continue; // Ignore features without ID
        }
  
        if (geometry instanceof Polygon) {
          const coordinates = geometry.getCoordinates()[0]; // Get only the outer ring
          // Call the backend to update the shape
          const response = await updateShape(shapeId, { coordinates });
          if (!response.success)
            throw new Error("API response indicates failure in some shape");
        }
      }
  
      showSimpleMessage("All changes saved", "successful");
      setModifiedFeatures([]); // Clear the state after saving
  
      // **UPDATE originalFeatures** to reflect the NEW "saved" state
      if (vectorLayer && vectorLayer.getSource()) {
        syncOriginalFeatures(vectorLayer.getSource()!, (features) => {
          setOriginalFeatures(features);
        });
      } else {
        console.warn("VectorLayer or source is not available. Cannot sync original features.");
      }
  
      onSaveComplete();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };
  
  const handleClick = async () => {
    const shapesExist = await checkShapesExist();
    if (!shapesExist) {
      showSimpleMessage("No shapes to edit", "warning");
      onSaveComplete();
      return;
    }
  
    if (isSelected) {
      // Confirm only for saving changes
      showConfirmMessage(
        "Do you want to save changes?",
        async () => await handleSaveChanges(), // Save the changes
        () => {
          /* Do nothing; the user remains in edit mode. */
        }
      );
    } else {
      // Activate edit mode
      onClick(() => {
        addModifyInteraction();
      });
    }
  };
  
  return (
    <button
      className={`edit-button ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      {isSelected ? "Save Changes" : "Edit"}
    </button>
  );
};
  
  export default EditTool;