import React from "react";
import Draw, { createBox } from "ol/interaction/Draw";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Polygon from "ol/geom/Polygon"; // Importa el tipo Polygon
import { createShape } from "../../services/apiService";
import "../../styles/rectangleTool.css";

interface RectangleToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  onDeactivate: () => void;
}

const RectangleTool: React.FC<RectangleToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  onDeactivate,
}) => {
  const addRectangleInteraction = () => {
    if (!map || !vectorLayer || !vectorLayer.getSource()) return;

    const drawInteraction = new Draw({
      source: vectorLayer.getSource()!,
      type: "Circle", // OpenLayers usa "Circle" para rectángulos
      geometryFunction: createBox(),
    });

    drawInteraction.on("drawend", async (event) => {
      const geometry = event.feature.getGeometry();
      if (geometry instanceof Polygon) {
        const coordinates3D = geometry.getCoordinates(); // Array tridimensional
        const coordinates2D = coordinates3D[0]; // Extraer solo el anillo exterior
        console.log("Rectangle saved (2D):", coordinates2D);


        // Guarda en el backend
        try {
          const savedShape = await createShape({
            type: "rectangle",
            coordinates: coordinates2D,
            userId: "12345", // ID de usuario (puede ser dinámico)
          });
          console.log("Rectangle saved to backend:", savedShape);
        } catch (error) {
          console.error("Error saving rectangle:", error);
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
    onClick(addRectangleInteraction); // Pasa la lógica de activación
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



