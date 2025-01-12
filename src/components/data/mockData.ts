import { Polygon } from "ol/geom";

const mockData = [
  [
    [
      [0, 0],
      [10e6, 0],
      [10e6, 10e6],
      [0, 10e6],
      [0, 0],
    ],
  ],
];

export function getMockFeatures() {
  return mockData.map((coordinates) => {
    return new Polygon(coordinates);
  });
}