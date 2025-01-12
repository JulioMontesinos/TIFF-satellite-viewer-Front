import React from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { click, pointerMove } from "ol/events/condition";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import "../../styles/clearTool.css";

interface ClearToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
}

const ClearTool: React.FC<ClearToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
}) => {
  const addDeleteInteraction = () => {
    if (!map || !vectorLayer) return;

    const selectInteraction = new Select({
      condition: pointerMove, // Detecta al mover el puntero
      layers: [vectorLayer],
    });

    // Cambiar el estilo al pasar el puntero
    selectInteraction.on("select", (event) => {
      const hoveredFeatures = event.selected;
      hoveredFeatures.forEach((feature) => {
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "rgba(255, 165, 0, 1)", // Color naranja brillante para el borde
              width: 3, // Ancho del borde
            }),
            fill: new Fill({
              color: "rgba(255, 165, 0, 0.3)", // Relleno naranja semitransparente
            }),
          })
        );
      });

      // Restaurar el estilo cuando el puntero salga de la figura
      event.deselected.forEach((feature) => {
        feature.setStyle(undefined) // Reestablece el estilo predeterminado
      });
    });

    // Interacción para eliminar figuras al hacer clic
    const deleteInteraction = new Select({
      condition: click,
      layers: [vectorLayer],
    });

    deleteInteraction.on("select", (event) => {
      const selectedFeatures = event.selected;
      selectedFeatures.forEach((feature) => {
        vectorLayer.getSource()?.removeFeature(feature);
      });
    });

    map.addInteraction(selectInteraction);
    map.addInteraction(deleteInteraction);
  };

  const handleClick = () => {
    onClick(addDeleteInteraction); // Activa la lógica de selección y eliminación
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