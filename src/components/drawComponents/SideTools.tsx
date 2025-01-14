import React, { useState } from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import RectangleTool from "./RectangleTool";
import PolygonTool from "./PolygonTool";
import EditTool from "./EditTool";
import ClearTool from "./ClearTool";
import ClearAllTool from "./ClearAllTool";
import {revertToOriginalState} from "../utils/shapeSyncService";
import Feature from "ol/Feature";
import "../../styles/sideTools.css";

import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select"; 

interface SideToolsProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful" | "confirm") => void;
  showConfirmMessage: (msg: string, onAccept: () => void, onReject?: () => void) => void;
  setOriginalFeatures: (features: Feature[]) => void; 
  originalFeatures: Feature[]; 
  isModeEditing: boolean;
  setIsModeEditing: (value: boolean) => void;
}

const SideTools: React.FC<SideToolsProps> = ({ 
  map,
  vectorLayer, 
  showSimpleMessage, 
  showConfirmMessage, 
  setOriginalFeatures, 
  originalFeatures, 
  isModeEditing, 
  setIsModeEditing  
}) => {
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

  // Define handleDiscardChanges here
const handleDiscardChanges = () => {
  if (vectorLayer && vectorLayer.getSource()) {
    revertToOriginalState(vectorLayer.getSource()!, originalFeatures); // Revert to the original state
    /* setOriginalFeatures([]); */ // Clear the original features
    showSimpleMessage("Changes discarded", "successful"); // Show a success message
  } else {
    console.warn("VectorLayer or source is not available. Cannot discard changes.");
  }
};

const handleToolClick = (tool: string, onActivate: () => void) => {
  // If you are in edit mode and switch to another tool
  if (isModeEditing && tool !== "edit") {
    showConfirmMessage(
      "You are in edit mode with unsaved changes. Do you want to discard them and continue?",
      () => {
        handleDiscardChanges();
        setIsModeEditing(false); // Update the global editing mode state
        deactivateAllInteractions();
        setSelectedTool(tool);
        onActivate();
      },
      () => {} // Do nothing if staying on the current tool
    );
    return;
  }

  // If the user selects the "edit" tool
  if (tool === "edit") {
    setIsModeEditing(true); // Enable edit mode
  } else {
    setIsModeEditing(false); // Exit edit mode
  }

  if (selectedTool === tool) {
    deactivateAllInteractions();
    setSelectedTool(null);
  } else {
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
      showSimpleMessage={showSimpleMessage}
      setOriginalFeatures={setOriginalFeatures} 
    />
    <PolygonTool
      map={map}
      vectorLayer={vectorLayer}
      isSelected={selectedTool === "polygon"}
      onClick={(onActivate) => handleToolClick("polygon", onActivate)}
      onDeactivate={handleDeactivateTool}
      showSimpleMessage={showSimpleMessage}
      setOriginalFeatures={setOriginalFeatures} 
    />
    <EditTool
      map={map}
      vectorLayer={vectorLayer}
      isSelected={selectedTool === "edit"}
      onClick={(onActivate) => handleToolClick("edit", onActivate)}
      onSaveComplete={() => { 
        setSelectedTool(null);
        setIsModeEditing(false);
      }}
      showSimpleMessage={showSimpleMessage}
      showConfirmMessage={showConfirmMessage}
      setOriginalFeatures={setOriginalFeatures} 
    />
    <ClearTool
      map={map}
      vectorLayer={vectorLayer}
      isSelected={selectedTool === "clear"}
      onClick={(onActivate) => handleToolClick("clear", onActivate)}
      showSimpleMessage={showSimpleMessage}
      showConfirmMessage={showConfirmMessage}
      setOriginalFeatures={setOriginalFeatures} 
    />
    <ClearAllTool
      vectorLayer={vectorLayer}
      onClick={() => {
        deactivateAllInteractions();
        setSelectedTool(null);
        vectorLayer?.getSource()?.clear();
      }}
      showSimpleMessage={showSimpleMessage}
      showConfirmMessage={showConfirmMessage}
      setOriginalFeatures={setOriginalFeatures} 
    />
  </div>
);
}

export default SideTools;
