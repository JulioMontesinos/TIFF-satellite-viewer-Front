import React from "react";
import Draw from "ol/interaction/Draw";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Polygon from "ol/geom/Polygon";
import { createShape } from "../../services/apiService";
import { syncOriginalFeatures } from "../utils/shapeSyncService";
import Feature from "ol/Feature";
import "../../styles/polygonTool.css";

interface PolygonToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  onDeactivate: () => void;
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful") => void;
  setOriginalFeatures: (features: Feature[]) => void;
}

const PolygonTool: React.FC<PolygonToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  onDeactivate,
  showSimpleMessage,
  setOriginalFeatures,
}) => {
  const addPolygonInteraction = () => {
    if (!map || !vectorLayer || !vectorLayer.getSource()) return;

    const drawInteraction = new Draw({
      source: vectorLayer.getSource()!,
      type: "Polygon",
    });

    drawInteraction.on("drawend", async (event) => {
      const geometry = event.feature.getGeometry();
      if (geometry instanceof Polygon) {
        const coordinates3D = geometry.getCoordinates(); // Three-dimensional array
        const coordinates2D = coordinates3D[0]; // Extract only the outer ring

        // Save to backend
        try {
          const response = await createShape({
            type: "polygon",
            coordinates: coordinates2D,
            userId: "12345", // User ID (can be dynamic)
          });

          // Verify and assign the returned ID to the feature
          if (response && response.success && response.shape._id) {
            event.feature.setId(response.shape._id); // Assign the backend ID to the feature
          } else {
            throw new Error("API response indicates failure");
          }

          showSimpleMessage("Polygon saved successfully", "successful");

          // **Update the original state**
          if (vectorLayer && vectorLayer.getSource()) {
            syncOriginalFeatures(vectorLayer.getSource()!, (features) => {
              setOriginalFeatures(features);
            });
          } else {
            console.warn("VectorLayer or source is not available. Cannot sync original features.");
          }
        } catch (error) {
          console.error("Error saving polygon:", error);
          showSimpleMessage("Error saving polygon", "error");
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
    onClick(addPolygonInteraction);
  };

  return (
    <button
      className={`polygon-button ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      Draw Polygon
    </button>
  );
};

export default PolygonTool;
