import React, { useState } from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import RectangleTool from "./RectangleTool";
import PolygonTool from "./PolygonTool";
import EditTool from "./EditTool";
import ClearTool from "./ClearTool";
import ClearAllTool from "./ClearAllTool";
import "../../styles/sideTools.css";

import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select"; 

interface SideToolsProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
}

const SideTools: React.FC<SideToolsProps> = ({ map, vectorLayer }) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const deactivateAllInteractions = () => {
    if (!map) return;
  
    map.getInteractions().forEach((interaction) => {
      if (
        interaction instanceof Draw ||
        interaction instanceof Modify ||
        interaction instanceof Select
      ) {
        map.removeInteraction(interaction);
      }
    });
  };

  const handleToolClick = (tool: string, onActivate: () => void) => {
    if (selectedTool === tool) {
      // Si el botón ya estaba seleccionado, desactivar todo
      deactivateAllInteractions();
      setSelectedTool(null);
    } else {
      // Desactivar todas las interacciones antes de activar una nueva
      deactivateAllInteractions();
      setSelectedTool(tool);
      onActivate();
    }
  };

  const handleDeactivateTool = () => {
    deactivateAllInteractions();
    setSelectedTool(null);
  };

  return (
    <div>
      <h3>Editing Tools</h3>
      <RectangleTool
        map={map}
        vectorLayer={vectorLayer}
        isSelected={selectedTool === "rectangle"}
        onClick={(onActivate) => handleToolClick("rectangle", onActivate)}
        onDeactivate={handleDeactivateTool}
      />
      <PolygonTool
        map={map}
        vectorLayer={vectorLayer}
        isSelected={selectedTool === "polygon"}
        onClick={(onActivate) => handleToolClick("polygon", onActivate)}
        onDeactivate={handleDeactivateTool}
      />
      <EditTool
        map={map}
        vectorLayer={vectorLayer}
        isSelected={selectedTool === "edit"}
        onClick={(onActivate) => handleToolClick("edit", onActivate)}
        onSaveComplete={() => setSelectedTool(null)}
      />
      <ClearTool
        map={map}
        vectorLayer={vectorLayer}
        isSelected={selectedTool === "clear"}
        onClick={(onActivate) => handleToolClick("clear", onActivate)}
      />
      <ClearAllTool
        vectorLayer={vectorLayer}
        onClick={() => {
          deactivateAllInteractions();
          setSelectedTool(null);
          vectorLayer?.getSource()?.clear();
        }}
      />
    </div>
  );
};

export default SideTools;