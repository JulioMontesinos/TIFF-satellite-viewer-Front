import React from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Modify from "ol/interaction/Modify";
import VectorSource from "ol/source/Vector";
import "../../styles/editTool.css";

interface EditToolProps {
  map: Map | null;
  vectorLayer: VectorLayer<VectorSource> | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
}

const EditTool: React.FC<EditToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
}) => {
  const addModifyInteraction = () => {
    if (!map || !vectorLayer || !vectorLayer.getSource()) return;

    const modifyInteraction = new Modify({
      source: vectorLayer.getSource()!,
    });

    map.addInteraction(modifyInteraction);
  };

  const handleClick = () => {
    onClick(addModifyInteraction);
  };

  return (
    <button
      className={`edit-button ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      Edit
    </button>
  );
};

export default EditTool;