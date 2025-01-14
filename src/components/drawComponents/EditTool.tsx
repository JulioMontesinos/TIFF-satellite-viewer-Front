import React, { useState } from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Modify from "ol/interaction/Modify";
import VectorSource from "ol/source/Vector";
import Polygon from "ol/geom/Polygon";
import { updateShape } from "../../services/apiService"; // Crear esta función para actualizar el backend
import { checkShapesExist } from "../../services/shapeService";
import "../../styles/editTool.css";

interface EditToolProps {
  map: Map | null;
  vectorLayer: VectorLayer<VectorSource> | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  onSaveComplete: () => void;
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful") => void;
  showConfirmMessage: (
    msg: string,
    onAccept: () => void,
    onReject?: () => void
  ) => void;
}

const EditTool: React.FC<EditToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  onSaveComplete,
  showSimpleMessage,
  showConfirmMessage,
}) => {
  const [modifiedFeatures, setModifiedFeatures] = useState<any[]>([]);

  const addModifyInteraction = () => {
    if (!map || !vectorLayer || !vectorLayer.getSource()) return;

    const modifyInteraction = new Modify({
      source: vectorLayer.getSource()!,
    });

    modifyInteraction.on("modifyend", (event) => {
      const modified = event.features.getArray();
    
      setModifiedFeatures((prevFeatures) => {
        // Añadir las nuevas figuras modificadas, evitando duplicados
        const updatedFeatures = [...prevFeatures];
        modified.forEach((feature) => {
          if (!updatedFeatures.some((f) => f === feature)) {
            updatedFeatures.push(feature);
          }
        });
        return updatedFeatures;
      });
    
    });

    map.addInteraction(modifyInteraction);
  };

  const handleSaveChanges = async () => {
    try {
      for (const feature of modifiedFeatures) {
        const geometry = feature.getGeometry();
        const shapeId = feature.getId();

        if (!shapeId) {
          console.warn("Feature does not have an ID:", feature);
          continue; // Ignora las features sin ID
        }
        
        if (geometry instanceof Polygon) {
          const coordinates = geometry.getCoordinates()[0]; // Obtiene solo el anillo exterior
           // Asegúrate de establecer los IDs en las features al cargarlas
          console.log("Saving shape:", { id: shapeId, coordinates });

          // Llama al backend para actualizar el shape
          const response = await updateShape(shapeId, { coordinates });
          if(!response.success)
            throw new Error("API response indicates failure in some shape");
          
        }
      }

      showSimpleMessage("All changes saved", "successful");
      setModifiedFeatures([]); // Limpia el estado después de guardar
      onSaveComplete();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleClick = async () => {
    const shapesExist = await checkShapesExist();
    if (!shapesExist) {
      showSimpleMessage("No shapes to edit", "warning");
      onSaveComplete();
      return;
    }
  
    if (isSelected) {
      // Confirmación solo para guardar los cambios
      showConfirmMessage(
        "Do you want to save changes?",
        async () => await handleSaveChanges(), // Guardar los cambios
        () => {
          console.log("User chose not to save changes. Remaining in edit mode.");
          // No hacer nada; el usuario sigue en modo edición.
        }
      );
    } else {
      // Activar el modo edición
      onClick(() => {
        addModifyInteraction();
      });
    }
  };

  return (
    <button
      className={`edit-button ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      {isSelected ? "Save Changes" : "Edit"}
    </button>
  );
};

export default EditTool;