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
import SideTools from "../components/drawComponents/SideTools";
import "../styles/MapContainer.css";

import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

const MapComponent: React.FC = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [map, setMap] = useState<Map | null>(null);

  // Persistente fuente de datos
  const vectorSource = useRef(new VectorSource()); // VectorSource reutilizable
  const vectorLayer = useRef(
    new VectorLayer({
      source: vectorSource.current,
      zIndex: 2,
      style: new Style({
        stroke: new Stroke({
          color: "rgba(255, 0, 0, 1)", // Color del borde (rojo)
          width: 2, // Ancho del borde
        }),
        fill: new Fill({
          color: "rgba(255, 255, 255, 0)", // Relleno completamente transparente
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
      target: mapElement.current!,
      layers: [baseLayer, cogLayer, vectorLayer.current],
      view: new View({
        center: [0, 0],
        zoom: 3,
        maxZoom: 16,
      }),
    });

    setMap(mapInstance);

    // Simular recuperación de datos del backend
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

    // Mock de datos desde el backend para inicializar figuras
    const mockData = [
      [
        [
          [0, 0],
          [10e6, 0],
          [10e6, 10e6],
          [0, 10e6],
          [0, 0],
        ],
      ], // Coordenadas de un polígono de ejemplo
    ];

    // Añadir figuras del mock al vectorSource
    mockData.forEach((coordinates) => {
      const feature = new Feature({
        geometry: new Polygon(coordinates),
      });
      vectorSource.current.addFeature(feature);
    });

    return () => mapInstance.setTarget(undefined); // Cleanup
  }, []);

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <div className={`app-container ${isEditing ? "editing" : ""}`}>
      <div className={`sidebar ${isEditing ? "visible" : ""}`}>
        <SideTools map={map} vectorLayer={vectorLayer.current} />
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