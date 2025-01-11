import React, { useState, useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import "../styles/MapContainer.css";

const MapComponent: React.FC = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const cogUrl = encodeURIComponent(import.meta.env.VITE_COG_URL || "");
    const tilesUrl = `${import.meta.env.VITE_TILES_URL}${cogUrl}`;
    const boundsUrl = `${import.meta.env.VITE_BOUNDS_URL}${cogUrl}`;

    // Create base layer (OpenStreetMap)
    const baseLayer = new TileLayer({
      source: new XYZ({
        url: import.meta.env.VITE_BASEMAP_URL || "", // CartoDB basemap
        attributions:
          'Map tiles by <a href="https://carto.com/">CartoDB</a>, under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, under ODbL.',
      }),
    });

    // Create GeoTIFF layer
    const cogLayer = new TileLayer({
      source: new XYZ({
        url: tilesUrl,
      }),
    });

    // Create the map
    const map = new Map({
      target: mapElement.current!,
      layers: [baseLayer, cogLayer],
      view: new View({
        center: [0, 0], // Initial coordinates in EPSG:3857
        zoom: 3, // Initial zoom level
        maxZoom: 16, // Maximum zoom level
      }),
    });

    // Adjust the view to show the GeoTIFF in full screen
    fetch(boundsUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.bounds)) {
          const southwest = fromLonLat([data.bounds[0], data.bounds[1]]); // Southwest corner
          const northeast = fromLonLat([data.bounds[2], data.bounds[3]]); // Northeast corner

          // Manually create the extent
          const extent: [number, number, number, number] = [
            southwest[0], // MinX
            southwest[1], // MinY
            northeast[0], // MaxX
            northeast[1], // MaxY
          ];

          // Adjust the view
          map.getView().fit(extent, { size: map.getSize(), padding: [20, 20, 20, 20] });
        }
      })
      .catch((error) => console.error("Error fetching bounds:", error));

    return () => map.setTarget(undefined); // Cleanup when unmounting
  }, []);

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <div className={`app-container ${isEditing ? "editing" : ""}`}>
      {/* Sidebar */}
      <div className={`sidebar ${isEditing ? "visible" : "hidden"}`}>
        <h3>Editing Tools</h3>
        <button>Draw Rectangle</button>
        <button>Draw Polygon</button>
        <button>Clear</button>
      </div>

      {/* Map */}
      <div
        className={`map-container`}
        ref={mapElement}
      >
        <button className="brush-button" onClick={toggleEditMode}>
          <img src="/edit.svg" alt="Edit" className="edit-icon" />
        </button>
      </div>
    </div>
  );
};

export default MapComponent;