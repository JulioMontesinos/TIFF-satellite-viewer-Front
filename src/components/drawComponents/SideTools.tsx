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
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful") => void;
  showConfirmMessage: (msg: string, onAccept: () => void, onReject?: () => void) => void;
  toggleEditMode: (onAccept: () => void) => void;
  setOriginalFeatures: (features: Feature[]) => void; 
  originalFeatures: Feature[]; 
  isModeEditing: boolean;
  setIsModeEditing: (value: boolean) => void;
}

const SideTools: React.FC<SideToolsProps> = ({ map, vectorLayer, showSimpleMessage, showConfirmMessage, toggleEditMode, setOriginalFeatures, originalFeatures, isModeEditing, setIsModeEditing  }) => {
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

  // Define handleDiscardChanges aquí
  const handleDiscardChanges = () => {
    if (vectorLayer && vectorLayer.getSource()) {
      console.log("Reverting to original state...");
      revertToOriginalState(vectorLayer.getSource()!, originalFeatures); // Usa revertToOriginalState
      setOriginalFeatures([]); // Limpia las features originales
      showSimpleMessage("Changes discarded", "successful"); // Muestra un mensaje de éxito
    } else {
      console.warn("VectorLayer or source is not available. Cannot discard changes.");
    }
  };

  const handleToolClick = (tool: string, onActivate: () => void) => {
    console.log("Selected tool:", selectedTool);
    console.log("Clicked tool:", tool);
    console.log("Is mode editing:", isModeEditing);
  
    // Si estás en modo edición y cambias a otra herramienta
    if (isModeEditing && tool !== "edit") {
      console.log("Attempting to leave edit mode...");
      showConfirmMessage(
        "You are in edit mode with unsaved changes. Do you want to discard them and continue?",
        () => {
          console.log("Confirmed: Exiting edit mode.");
          handleDiscardChanges();
          setIsModeEditing(false); // Actualiza el estado global del modo edición
          deactivateAllInteractions();
          setSelectedTool(tool);
          onActivate();
          
        },
        () => console.log("Stayed in edit mode.") // Rechazó salir del modo edición
      );
      return;
    }
  
    // Si el usuario selecciona la herramienta "edit"
    if (tool === "edit") {
      setIsModeEditing(true); // Activar modo edición
    } else {
      setIsModeEditing(false); // Salir del modo edición
    }
  
    if (selectedTool === tool) {
      console.log("Deactivating current tool:", tool);
      deactivateAllInteractions();
      setSelectedTool(null);
    } else {
      console.log("Activating new tool:", tool);
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
        onSaveComplete={() => setSelectedTool(null)}
        showSimpleMessage={showSimpleMessage}
        showConfirmMessage={showConfirmMessage}
      />
      <ClearTool
        map={map}
        vectorLayer={vectorLayer}
        isSelected={selectedTool === "clear"}
        onClick={(onActivate) => handleToolClick("clear", onActivate)}
        showSimpleMessage={showSimpleMessage}
        showConfirmMessage={showConfirmMessage}
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
      />
    </div>
  );
};

export default SideTools;