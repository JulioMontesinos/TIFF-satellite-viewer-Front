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
  setOriginalFeatures
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
        const coordinates3D = geometry.getCoordinates(); // Array tridimensional
        const coordinates2D = coordinates3D[0]; // Extraer solo el anillo exterior

        // Guarda en el backend
        try {
          const response = await createShape({
            type: "polygon",
            coordinates: coordinates2D,
            userId: "12345", // ID de usuario (puede ser dinámico)
          });

          // Verifica y asigna el ID retornado al feature
          if (response && response.success && response.shape._id) {
            event.feature.setId(response.shape._id); // Asigna el ID del backend al feature
          
          }else{
            throw new Error("API response indicates failure");
          }

          showSimpleMessage("Polygon saved successfully", "successful");
          // **Actualiza el estado original**
          syncOriginalFeatures(vectorLayer.getSource()!, (features) => {
            setOriginalFeatures(features);
          });
          
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