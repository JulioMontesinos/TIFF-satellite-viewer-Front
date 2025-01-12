import React from "react";
import Draw, { createBox } from "ol/interaction/Draw";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Polygon from "ol/geom/Polygon"; // Importa el tipo Polygon
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

    drawInteraction.on("drawend", (event) => {
      const geometry = event.feature.getGeometry();
      if (geometry instanceof Polygon) {
        // Si la geometría es un polígono, obtiene las coordenadas
        const coordinates = geometry.getCoordinates();
        console.log("Rectangle saved:", coordinates);
        // Remove the interaction after the drawing is complete
        map.removeInteraction(drawInteraction);
        onDeactivate();

      } else {
        console.warn("Unexpected geometry type:", geometry?.getType());
      }
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



