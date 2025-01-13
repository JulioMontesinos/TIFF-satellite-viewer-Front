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

import "../styles/MapContainer.css";

import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

const MapComponent: React.FC = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [map, setMap] = useState<Map | null>(null);
  const [shapes, setShapes] = useState<any[]>([]);

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
          color: "rgba(255, 255, 255, 0.1)", // Relleno completamente transparente
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

    fetch(boundsUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data && Array.isArray(data.bounds)) {
        console.log("Image bounds:", data.bounds);
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

    // Obtener figuras reales del backend
    const fetchShapes = async () => {
      try {
        const shapesData = await getShapes(); // Llama a la API
        console.log("Shapes fetched from backend:", shapesData);
        setShapes(shapesData); // Actualiza el estado con las figuras
    
        // Añadir cada figura al mapa
        shapesData.forEach((shape: any) => {
          console.log("Processing shape:", shape);
        
          // Asegúrate de procesar todas las coordenadas del shape
          const coordinates2D  = shape.coordinates[0].map((coord: number[]) =>
            fromLonLat([coord[0], coord[1]]) // Solo longitud y latitud
          );
        
          console.log("Coordinates (EPSG:4326):", shape.coordinates[0]);
          console.log("Coordinates (EPSG:3857):", coordinates2D);
        
          const feature = new Feature({
            geometry: new Polygon([coordinates2D ]), // Convierte coordenadas a Polygon
          });
        
          vectorSource.current.addFeature(feature); // Añade la figura a la capa vectorial
          console.log("Feature added to map:", feature);
        });
      } catch (error) {
        console.error("Error fetching shapes from the backend:", error);
      }
    };

    fetchShapes();
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