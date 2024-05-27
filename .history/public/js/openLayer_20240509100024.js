// eslint-disable-next-line no-undef
const coordinate = JSON.parse(document.getElementById('map').dataset.locations);

// Cria uma nova camada de vetor para armazenar os pontos
const vectorSource = new ol.source.Vector();

coordinate.forEach((coord) => {
  const marker = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat(coord.coordinates)),
  });

  // Adiciona o marcador à fonte de dados da camada de vetor
  vectorSource.addFeature(marker);
});

// Cria a camada de vetor
const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/img/pin.png',
      scale: 0.03,
    }),
  }),
});

// Cria o mapa
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    vectorLayer, // Adiciona a camada de vetor ao mapa
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat(coordinate[0].coordinates),
    zoom: 5,
    minZoom: 4,
    maxZoom: 8,
  }),
});
