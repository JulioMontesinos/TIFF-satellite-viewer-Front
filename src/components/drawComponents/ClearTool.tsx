import React from "react";
import VectorLayer from "ol/layer/Vector";

interface ClearToolProps {
  vectorLayer: VectorLayer | null;
}

const ClearTool: React.FC<ClearToolProps> = ({ vectorLayer }) => {
  const clearGeometries = () => {
    vectorLayer?.getSource()?.clear();
  };

  return <button onClick={clearGeometries}>Clear</button>;
};

export default ClearTool;