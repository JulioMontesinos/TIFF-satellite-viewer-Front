import React, { useState, useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import SideTools from "../components/drawComponents/SideTools";
import "../styles/MapContainer.css";

const MapComponent: React.FC = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [map, setMap] = useState<Map | null>(null);
  const vectorLayer = new VectorLayer({
    source: new VectorSource(),
  });

  useEffect(() => {
    const cogUrl = encodeURIComponent(import.meta.env.VITE_COG_URL || "");
    const tilesUrl = `${import.meta.env.VITE_TILES_URL}${cogUrl}`;
    const boundsUrl = `${import.meta.env.VITE_BOUNDS_URL}${cogUrl}`;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: import.meta.env.VITE_BASEMAP_URL || "",
      }),
    });

    const cogLayer = new TileLayer({
      source: new XYZ({
        url: tilesUrl,
      }),
    });

    const mapInstance = new Map({
      target: mapElement.current!,
      layers: [baseLayer, cogLayer, vectorLayer],
      view: new View({
        center: [0, 0],
        zoom: 3,
        maxZoom: 16,
      }),
    });

    setMap(mapInstance);

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
      });

    return () => mapInstance.setTarget(undefined);
  }, []);

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <div className={`app-container ${isEditing ? "editing" : ""}`}>
      <div className={`sidebar ${isEditing ? "visible" : ""}`}>
        <SideTools map={map} vectorLayer={vectorLayer} />
      </div>
      <div className="map-container" ref={mapElement}>
        <button className="brush-button" onClick={toggleEditMode}>
          <img src="/edit.svg" alt="Edit" className="edit-icon" />
        </button>
      </div>
    </div>
  );
};

export default MapComponent;