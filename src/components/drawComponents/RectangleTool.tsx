import React from "react";
import Draw, { createBox } from "ol/interaction/Draw";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";

interface RectangleToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
}

const RectangleTool: React.FC<RectangleToolProps> = ({ map, vectorLayer }) => {
  const addRectangleInteraction = () => {
    if (!map || !vectorLayer) return;

    // Remove existing interactions
    map.getInteractions().forEach((interaction) => {
      if (interaction instanceof Draw) {
        map.removeInteraction(interaction);
      }
    });

    // Add drawing interaction for rectangles
    const drawInteraction = new Draw({
      source: vectorLayer.getSource()!,
      type: "Circle", // OpenLayers uses "Circle" for rectangles
      geometryFunction: createBox(),
    });

    map.addInteraction(drawInteraction);
  };

  return <button onClick={addRectangleInteraction}>Draw Rectangle</button>;
};

export default RectangleTool;