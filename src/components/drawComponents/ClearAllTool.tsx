import React from "react";
import VectorLayer from "ol/layer/Vector";
import "../../styles/clearAllTool.css";

interface ClearAllToolProps {
  vectorLayer: VectorLayer | null;
  onClick: () => void;
}

const ClearAllTool: React.FC<ClearAllToolProps> = ({ vectorLayer, onClick }) => {
  const clearAll = () => {
    vectorLayer?.getSource()?.clear();
    onClick();
  };

  return (
    <button className="clearAll-button" onClick={clearAll}>
      Clear All
    </button>
  );
};

export default ClearAllTool;