import React from "react";
import Draw from "ol/interaction/Draw";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";

interface PolygonToolProps {
  map: Map | null;
  vectorLayer: VectorLayer | null;
}

const PolygonTool: React.FC<PolygonToolProps> = ({ map, vectorLayer }) => {
  const addPolygonInteraction = () => {
    if (!map || !vectorLayer) return;

    // Remove existing interactions
    map.getInteractions().forEach((interaction) => {
      if (interaction instanceof Draw) {
        map.removeInteraction(interaction);
      }
    });

    // Add drawing interaction for polygons
    const drawInteraction = new Draw({
      source: vectorLayer.getSource()!,
      type: "Polygon",
    });

    map.addInteraction(drawInteraction);
  };

  return <button onClick={addPolygonInteraction}>Draw Polygon</button>;
};

export default PolygonTool;