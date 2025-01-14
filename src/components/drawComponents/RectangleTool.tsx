import React from "react";
import Draw, { createBox } from "ol/interaction/Draw";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Polygon from "ol/geom/Polygon"; // Importa el tipo Polygon
import Feature from "ol/Feature";
import { createShape } from "../../services/apiService";
import {syncOriginalFeatures } from "../utils/shapeSyncService";
import "../../styles/rectangleTool.css";

interface RectangleToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  onDeactivate: () => void;
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful") => void;
  setOriginalFeatures: (features: Feature[]) => void;
}

const RectangleTool: React.FC<RectangleToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  onDeactivate,
  showSimpleMessage,
  setOriginalFeatures,
}) => {
  const addRectangleInteraction = () => {
    if (!map || !vectorLayer || !vectorLayer.getSource()) return;

    const drawInteraction = new Draw({
      source: vectorLayer.getSource()!,
      type: "Circle", // OpenLayers uses "Circle" for rectangles
      geometryFunction: createBox(),
    });

    drawInteraction.on("drawend", async (event) => {
      const geometry = event.feature.getGeometry();
      if (geometry instanceof Polygon) {
        const coordinates3D = geometry.getCoordinates(); // Three-dimensional array
        const coordinates2D = coordinates3D[0]; // Extract only the outer ring

        // Save to backend
        try {
          const response = await createShape({
            type: "rectangle",
            coordinates: coordinates2D,
            userId: "12345",
          });

          // Verify and assign the returned ID to the feature
          if (response && response.success && response.shape._id) {
            event.feature.setId(response.shape._id); // Assign the backend ID to the feature
            showSimpleMessage("Rectangle saved successfully", "successful");

            // **Update the original state**
            if (vectorLayer && vectorLayer.getSource()) {
              syncOriginalFeatures(vectorLayer.getSource()!, (features) => {
                setOriginalFeatures(features);
              });
            } else {
              console.warn("VectorLayer or source is not available. Cannot sync original features.");
            }
          } else {
            throw new Error("API response indicates failure");
          }
        } catch (error) {
          console.error("Error saving rectangle:", error);
          showSimpleMessage("Error saving rectangle", "error");
        }
      } else {
        console.warn("Unexpected geometry type:", geometry?.getType());
      }

      // Remove the interaction after the drawing is complete
      map.removeInteraction(drawInteraction);
      onDeactivate();
    });

    map.addInteraction(drawInteraction);
  };

  const handleClick = () => {
    onClick(addRectangleInteraction); // Pass the activation logic
  };

  return (
    <button
      className={`rectangle-button ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      Draw Rectangle
    </button>
  );
};

export default RectangleTool;



