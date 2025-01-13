import React, { useState } from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Modify from "ol/interaction/Modify";
import VectorSource from "ol/source/Vector";
import Polygon from "ol/geom/Polygon";
import { updateShape } from "../../services/apiService"; // Crear esta función para actualizar el backend
import "../../styles/editTool.css";

interface EditToolProps {
  map: Map | null;
  vectorLayer: VectorLayer<VectorSource> | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  onSaveComplete: () => void;
}

const EditTool: React.FC<EditToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  onSaveComplete,
}) => {
  const [modifiedFeatures, setModifiedFeatures] = useState<any[]>([]);

  const addModifyInteraction = () => {
    if (!map || !vectorLayer || !vectorLayer.getSource()) return;

    const modifyInteraction = new Modify({
      source: vectorLayer.getSource()!,
    });

    modifyInteraction.on("modifyend", (event) => {
      const modified = event.features.getArray();
      console.log("Modified features:", modified);

      // Almacena las modificaciones en el estado
      setModifiedFeatures(modified.map((feature) => feature));
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
          await updateShape(shapeId, { coordinates });
        }
      }

      console.log("All changes saved.");
      setModifiedFeatures([]); // Limpia el estado después de guardar
      onSaveComplete();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleClick = () => {
    if (isSelected) {
      handleSaveChanges(); // Guarda los cambios al desactivar la edición
    } else {
      onClick(addModifyInteraction);
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