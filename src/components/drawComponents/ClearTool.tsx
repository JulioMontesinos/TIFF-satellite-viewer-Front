import React from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { click } from "ol/events/condition";
import "../../styles/clearTool.css";

interface ClearToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
}

const ClearTool: React.FC<ClearToolProps> = ({ map, vectorLayer, isSelected, onClick }) => {
  const addDeleteInteraction = () => {
    if (!map || !vectorLayer) return;

    const selectInteraction = new Select({
      condition: click,
      layers: [vectorLayer],
    });

    selectInteraction.on("select", (event) => {
      const selectedFeatures = event.selected;
      selectedFeatures.forEach((feature) => {
        vectorLayer.getSource()?.removeFeature(feature);
      });
    });

    map.addInteraction(selectInteraction);
  };

  const handleClick = () => {
    onClick(addDeleteInteraction);
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