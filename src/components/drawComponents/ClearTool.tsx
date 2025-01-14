import React from "react";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { click, pointerMove } from "ol/events/condition";
import { deleteShape } from "../../services/apiService";
import { checkShapesExist } from "../../services/shapeService";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import "../../styles/clearTool.css";

interface ClearToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
  isSelected: boolean;
  onClick: (onActivate: () => void) => void;
  showSimpleMessage: (msg: string, type: "warning" | "error" | "successful" | "confirm") => void;
  showConfirmMessage: (
    msg: string,
    onAccept: () => void,
    onReject?: () => void
  ) => void;
}

const ClearTool: React.FC<ClearToolProps> = ({
  map,
  vectorLayer,
  isSelected,
  onClick,
  showSimpleMessage,
  showConfirmMessage
}) => {
  const addDeleteInteraction = () => {
    if (!map || !vectorLayer) return;

    const selectInteraction = new Select({
      condition: pointerMove, // Detecta al mover el puntero
      layers: [vectorLayer],
    });

    // Cambiar el estilo al pasar el puntero
    selectInteraction.on("select", (event) => {
      const hoveredFeatures = event.selected;
      hoveredFeatures.forEach((feature) => {
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "rgba(255, 165, 0, 1)", // Color naranja brillante para el borde
              width: 3, // Ancho del borde
            }),
            fill: new Fill({
              color: "rgba(255, 165, 0, 0.3)", // Relleno naranja semitransparente
            }),
          })
        );
      });

      // Restaurar el estilo cuando el puntero salga de la figura
      event.deselected.forEach((feature) => {
        feature.setStyle(undefined) // Reestablece el estilo predeterminado
      });
    });

    // Interacción para eliminar figuras al hacer clic
    const deleteInteraction = new Select({
      condition: click,
      layers: [vectorLayer],
    });

    deleteInteraction.on("select", async (event) => {
      const selectedFeatures = event.selected;

      for (const feature of selectedFeatures) {
        const shapeId = feature.getId(); // Obtén el ID de la figura
        if (!shapeId) {
          console.warn("Feature does not have an ID:", feature);
          continue; // Si no tiene ID, ignóralo
        }

        // Mostrar mensaje de confirmación antes de eliminar
        showConfirmMessage(
          "Are you sure you want to delete this object?",
          async () => {
            try {
              // Llama al backend para eliminar la figura
              const response = await deleteShape(String(shapeId));
              if(response.success){
                // Elimina la figura del mapa
                vectorLayer.getSource()?.removeFeature(feature);
                showSimpleMessage("Shape deleted successfully", "successful");
                
            } else {
                showSimpleMessage("Error deleting shape", "error");
                throw new Error("API response indicates failure");
            }
            } catch (error) {
              console.error(`Error deleting shape with ID ${shapeId}:`, error);
              showSimpleMessage("Error deleting shape", "error");
            }
          },
          () => {
            showSimpleMessage("Deletion cancelled", "confirm");
          }
        );
      }
    });

    map.addInteraction(selectInteraction);
    map.addInteraction(deleteInteraction);
  };

  const handleClick = async() => {
    const shapesExist = await checkShapesExist();
    if (!shapesExist) {
      showSimpleMessage("No shapes to clear", "warning");
      return;
    }
    onClick(addDeleteInteraction); // Activa la lógica de selección y eliminación
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