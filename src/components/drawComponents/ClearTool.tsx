import React from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { click, pointerMove } from "ol/events/condition";
import { deleteShape } from "../../services/apiService";
import { checkShapesExist } from "../../services/shapeService";
import { syncOriginalFeatures } from "../utils/shapeSyncService";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Feature from "ol/Feature";
import "../../styles/clearTool.css";

interface ClearToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful" | "confirm") => void;
  showConfirmMessage: (
    msg: string,
    onAccept: () => void,
    onReject?: () => void
  ) => void;
  setOriginalFeatures: (features: Feature[]) => void;
}

const ClearTool: React.FC<ClearToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  showSimpleMessage,
  showConfirmMessage,
  setOriginalFeatures,
}) => {
  const addDeleteInteraction = () => {
    if (!map || !vectorLayer) return;

    const selectInteraction = new Select({
      condition: pointerMove, // Detects when the pointer moves
      layers: [vectorLayer],
    });

    // Change style when hovering over a feature
    selectInteraction.on("select", (event) => {
      const hoveredFeatures = event.selected;
      hoveredFeatures.forEach((feature) => {
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "rgba(255, 165, 0, 1)", // Bright orange border color
              width: 3, // Border width
            }),
            fill: new Fill({
              color: "rgba(255, 165, 0, 0.3)", // Semi-transparent orange fill
            }),
          })
        );
      });

      // Restore style when the pointer leaves the feature
      event.deselected.forEach((feature) => {
        feature.setStyle(undefined); // Reset to default style
      });
    });

    // Interaction to delete features on click
    const deleteInteraction = new Select({
      condition: click,
      layers: [vectorLayer],
    });

    deleteInteraction.on("select", async (event) => {
      const selectedFeatures = event.selected;

      for (const feature of selectedFeatures) {
        const shapeId = feature.getId(); // Get the feature ID
        if (!shapeId) {
          console.warn("Feature does not have an ID:", feature);
          continue; // Ignore if no ID is present
        }

        // Show confirmation message before deleting
        showConfirmMessage(
          "Are you sure you want to delete this object?",
          async () => {
            try {
              // Call backend to delete the feature
              const response = await deleteShape(String(shapeId));
              if (response.success) {
                // Remove the feature from the map
                vectorLayer.getSource()?.removeFeature(feature);
                showSimpleMessage("Shape deleted successfully", "successful");
                if (vectorLayer && vectorLayer.getSource()) {
                  syncOriginalFeatures(vectorLayer.getSource()!, (features) => {
                    setOriginalFeatures(features);
                  });
                } else {
                  console.warn("VectorLayer or source is not available. Cannot sync original features.");
                }
              } else {
                showSimpleMessage("Error deleting shape", "error");
                throw new Error("API response indicates failure");
              }
            } catch (error) {
              console.error(`Error deleting shape with ID ${shapeId}:`, error);
              showSimpleMessage("Error deleting shape", "error");
            }
          },
          () => {
            showSimpleMessage("Deletion cancelled", "confirm");
          }
        );
      }
    });

    map.addInteraction(selectInteraction);
    map.addInteraction(deleteInteraction);
  };

  const handleClick = async () => {
    const shapesExist = await checkShapesExist();
    if (!shapesExist) {
      showSimpleMessage("No shapes to clear", "warning");
      return;
    }
    onClick(addDeleteInteraction); // Activates the selection and deletion logic
  };

  return (
    <button
      className={`clear-button ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      Clear Object
    </button>
  );
};

export default ClearTool;
