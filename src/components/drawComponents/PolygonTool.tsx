import React from "react";
import Draw from "ol/interaction/Draw";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Polygon from "ol/geom/Polygon";
import "../../styles/polygonTool.css";

interface PolygonToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  onDeactivate: () => void;
}

const PolygonTool: React.FC<PolygonToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  onDeactivate
}) => {
  const addPolygonInteraction = () => {
    if (!map || !vectorLayer || !vectorLayer.getSource()) return;

    const drawInteraction = new Draw({
      source: vectorLayer.getSource()!,
      type: "Polygon",
    });

    drawInteraction.on("drawend", (event) => {
      const geometry = event.feature.getGeometry();
      if (geometry instanceof Polygon) {
        // Si la geometría es un polígono, obtiene las coordenadas
        const coordinates = geometry.getCoordinates();
        console.log("Polygon saved:", coordinates);
        saveToBackend(coordinates);
      } else {
        console.warn("Unexpected geometry type:", geometry?.getType());
      }
      // Remove the interaction after the drawing is complete
      map.removeInteraction(drawInteraction);
      onDeactivate();
    });

    map.addInteraction(drawInteraction);
  };

  const saveToBackend = (coordinates: any) => {
    console.log("Mock save to backend:", coordinates);
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