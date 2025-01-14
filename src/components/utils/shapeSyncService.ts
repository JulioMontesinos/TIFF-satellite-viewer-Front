import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";

// Sincroniza los features actuales en el mapa con el estado original
export const syncOriginalFeatures = (source: VectorSource, updateState: (features: Feature[]) => void) => {
  const features = source.getFeatures().map((orig) => {
    const clone = orig.clone();
    clone.setId(orig.getId());
    return clone;
  });
  updateState(features);
};

// Restaura las features originales en el mapa
export const revertToOriginalState = (
  vectorSource: VectorSource, 
  originalFeatures: Feature[]
) => {
  vectorSource.clear(); // Limpia las features actuales
  originalFeatures.forEach((orig) => {
    const clone = orig.clone();
    clone.setId(orig.getId());   // <-- copiar el ID al clon
    vectorSource.addFeature(clone);
  });
};

export const areCoordinatesEqual = (coords1: number[][], coords2: number[][]): boolean => {
    if (coords1.length !== coords2.length) return false;
  
    return coords1.every((point, index) => {
      return (
        point.length === coords2[index].length &&
        point.every((coord, i) => coord === coords2[index][i])
      );
    });
  }