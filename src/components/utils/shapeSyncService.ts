import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";

// Synchronizes the current features on the map with the original state
export const syncOriginalFeatures = (source: VectorSource, updateState: (features: Feature[]) => void) => {
  const features = source.getFeatures().map((orig) => {
    const clone = orig.clone();
    clone.setId(orig.getId());
    return clone;
  });
  updateState(features);
};

// Restores the original features on the map
export const revertToOriginalState = (vectorSource: VectorSource, originalFeatures: Feature[]) => {
  vectorSource.clear(); // Clears the current features
  originalFeatures.forEach((orig) => {
    const clone = orig.clone();
    clone.setId(orig.getId()); // Copy the ID to the clone
    vectorSource.addFeature(clone);
  });
};

// Checks if two sets of coordinates are equal
export const areCoordinatesEqual = (coords1: number[][], coords2: number[][]): boolean => {
  if (coords1.length !== coords2.length) return false;

  return coords1.every((point, index) => {
    return (
      point.length === coords2[index].length &&
      point.every((coord, i) => coord === coords2[index][i])
    );
  });
};