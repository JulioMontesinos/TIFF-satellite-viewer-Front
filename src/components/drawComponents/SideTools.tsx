import React from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import RectangleTool from "./RectangleTool";
import PolygonTool from "./PolygonTool";
import ClearTool from "./ClearTool";
import "../../styles/sideTools.css"; 

interface SideToolsProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
}

const SideTools: React.FC<SideToolsProps> = ({ map, vectorLayer }) => {
  return (
    <div>
      <h3>Editing Tools</h3>
      <RectangleTool map={map} vectorLayer={vectorLayer} />
      <PolygonTool map={map} vectorLayer={vectorLayer} />
      <ClearTool vectorLayer={vectorLayer} />
    </div>
  );
};

export default SideTools;