import React, { useState, useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
/* import Feature from "ol/Feature"; 
import { getMockFeatures } from "./data/mockData";  */
import SideTools from "../components/drawComponents/SideTools";
import { getShapes } from "../services/apiService";
import { fetchToken } from "../services/apiService";
import { syncOriginalFeatures } from "./utils/shapeSyncService";


import "../styles/MapContainer.css";
import SimpleMessageBar from "../components/utils/SimpleMessageBar";
import ConfirmMessageBar from "../components/utils/ConfirmMessageBar";

import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

const MapComponent: React.FC = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [isToolVisible, setIsToolVisible] = useState(false);
  const [isModeEditing, setIsModeEditing] = useState(false);
  const [originalFeatures, setOriginalFeatures] = useState<Feature[]>([]);
  const [map, setMap] = useState<Map | null>(null);

  const [shapes, setShapes] = useState<any[]>([]);
  const [isMessageActive, setIsMessageActive] = useState(false);

  const [simpleMessage, setSimpleMessage] = useState<{
    text: string;
    type: "warning" | "error" | "successful" | "confirm";
  } | null>(null);
  
  const [confirmMessage, setConfirmMessage] = useState<{
    text: string;
    onAccept: () => void;
    onReject: () => void;
  } | null>(null);

  const showSimpleMessage = (text: string, type: "warning" | "error" | "successful" | "confirm") => {
    if (isMessageActive) return;

    setSimpleMessage({ text, type });
    setIsMessageActive(true);

    setTimeout(() => {
      setSimpleMessage(null);
      setIsMessageActive(false);
    }, 2000);
  };
  
  const showConfirmMessage = (
    text: string,
    onAccept: () => void,
    onReject?: () => void
  ) => {
    setConfirmMessage({ text, onAccept, onReject: onReject || (() => {}) });
  };

  // Persistent data source
const vectorSource = useRef(new VectorSource()); // Reusable VectorSource
const vectorLayer = useRef(
  new VectorLayer({
    source: vectorSource.current,
    zIndex: 2,
    style: new Style({
      stroke: new Stroke({
        color: "rgba(255, 0, 0, 1)", // Border color (red)
        width: 2, // Border width
      }),
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.1)", // Fill color with low opacity
      }),
    }),
  })
);

useEffect(() => {
  const cogUrl = encodeURIComponent(import.meta.env.VITE_COG_URL || "");
  const tilesUrl = `${import.meta.env.VITE_TILES_URL}${cogUrl}`;
  const boundsUrl = `${import.meta.env.VITE_BOUNDS_URL}${cogUrl}`;

  const baseLayer = new TileLayer({
    source: new XYZ({
      url: import.meta.env.VITE_BASEMAP_URL || "",
    }),
    zIndex: 0,
  });

  const cogLayer = new TileLayer({
    source: new XYZ({
      url: tilesUrl,
    }),
    zIndex: 1,
  });

  const mapInstance = new Map({
    target: mapElement.current!, // Target the map container
    layers: [baseLayer, cogLayer, vectorLayer.current], // Add base, cog, and vector layers
    view: new View({
      center: [0, 0], // Initial center coordinates
      zoom: 3, // Initial zoom level
      maxZoom: 16, // Maximum zoom level
    }),
  });

  setMap(mapInstance);

  // Fetch and fit bounds from the backend
  fetch(boundsUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data && Array.isArray(data.bounds)) {
        const southwest = fromLonLat([data.bounds[0], data.bounds[1]]);
        const northeast = fromLonLat([data.bounds[2], data.bounds[3]]);
        const extent: [number, number, number, number] = [
          southwest[0],
          southwest[1],
          northeast[0],
          northeast[1],
        ];
        mapInstance.getView().fit(extent, { size: mapInstance.getSize(), padding: [20, 20, 20, 20] });
      }
    })
    .catch((err) => console.error("Error fetching bounds:", err));

  // Fetch real shapes from the backend
  const fetchShapes = async () => {
    try {
      await fetchToken(); // Ensure a valid token is available
      const shapesData = await getShapes(); // Call the API
      setShapes(shapesData); // Update the state with the shapes

      // Add each shape to the map
      shapesData.shapes.forEach((shape: any) => {
        const coordinates2D = shape.coordinates;
        const feature = new Feature({
          geometry: new Polygon([coordinates2D]), // Convert coordinates to Polygon
        });
        // Assign the backend ID to the feature
        feature.setId(shape._id);

        vectorSource.current.addFeature(feature); // Add the shape to the vector layer
        syncOriginalFeatures(vectorSource.current, setOriginalFeatures);
      });
    } catch (error) {
      console.error("Error fetching shapes from the backend:", error);
    }
  };

  fetchShapes();
  return () => mapInstance.setTarget(undefined); // Cleanup when unmounting
}, []);

return (
  <div className={`app-container ${isToolVisible ? "editing" : ""}`}>
    <div className={`sidebar ${isToolVisible ? "visible" : ""}`}>
      <SideTools 
        map={map} 
        vectorLayer={vectorLayer.current} 
        showSimpleMessage={showSimpleMessage} 
        showConfirmMessage={showConfirmMessage}
        setOriginalFeatures={setOriginalFeatures}
        originalFeatures={originalFeatures}
        isModeEditing={isModeEditing}
        setIsModeEditing={setIsModeEditing}
      />
    </div>
    <div className="map-container" ref={mapElement}>

      {/* Simple message notification */}
      {simpleMessage && (
        <SimpleMessageBar
          message={simpleMessage.text}
          type={simpleMessage.type}
          onDismiss={() => setSimpleMessage(null)}
        />
      )}

      {/* Confirmation message notification */}
      {confirmMessage && (
        <ConfirmMessageBar
          message={confirmMessage.text}
          onAccept={() => {
            confirmMessage.onAccept();
            setConfirmMessage(null);
          }}
          onReject={() => {
            confirmMessage.onReject();
            setConfirmMessage(null);
          }}
        />
      )}

      <button className="brush-button" onClick={() => setIsToolVisible(!isToolVisible)}>
        <img src="/edit.svg" alt="Edit" className="edit-icon" />
      </button>
    </div>
  </div>
);
};

export default MapComponent;