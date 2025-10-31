"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { POLYGON_COORDINATES, getPerimeterBounds } from "@/lib/utils/polygon-validation";

// Configurar ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Ícone personalizado para marcador válido
const validMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Ícone personalizado para marcador inválido
const invalidMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapaEnderecoProps {
  latitude?: number | null;
  longitude?: number | null;
  onMapClick: (lat: number, lng: number) => void;
}

// Componente para capturar cliques no mapa
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

// Componente para centralizar o mapa quando as coordenadas mudarem
function MapUpdater({ latitude, longitude }: { latitude?: number | null; longitude?: number | null }) {
  const map = useMapEvents({});
  
  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], 16);
    }
  }, [latitude, longitude, map]);
  
  return null;
}

export default function MapaEndereco({ latitude, longitude, onMapClick }: MapaEnderecoProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Obter bounds do perímetro para centralizar o mapa
  const bounds = getPerimeterBounds();
  const center: [number, number] = [
    (bounds.minLatitude + bounds.maxLatitude) / 2,
    (bounds.minLongitude + bounds.maxLongitude) / 2
  ];

  // Converter coordenadas do polígono para formato do Leaflet
  const polygonPositions: [number, number][] = POLYGON_COORDINATES.map(coord => [coord[1], coord[0]]);

  // Determinar se o marcador está dentro do perímetro
  const isMarkerValid = latitude && longitude ? 
    require("@/lib/utils/polygon-validation").isWithinOUCBTPerimeter(latitude, longitude) : 
    false;

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border">
      <MapContainer
        key="oucbt-map"
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Polígono do perímetro da OUC */}
        <Polygon
          positions={polygonPositions}
          pathOptions={{
            color: "#3b82f6",
            weight: 2,
            opacity: 0.8,
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
          }}
        >
          <Popup>
            <div className="text-center">
              <strong>Perímetro da OUC Bairros do Tamanduateí</strong>
              <br />
              <span className="text-sm text-gray-600">
                Área permitida para inscrição
              </span>
            </div>
          </Popup>
        </Polygon>

        {/* Marcador da posição selecionada */}
        {latitude && longitude && (
          <Marker
            position={[latitude, longitude]}
            icon={isMarkerValid ? validMarkerIcon : invalidMarkerIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>
                  {isMarkerValid ? "Localização Válida" : "Localização Inválida"}
                </strong>
                <br />
                <span className="text-sm text-gray-600">
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </span>
                <br />
                <span className={`text-sm ${isMarkerValid ? "text-green-600" : "text-red-600"}`}>
                  {isMarkerValid 
                    ? "Dentro do perímetro da OUC" 
                    : "Fora do perímetro da OUC"
                  }
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Handlers para interação com o mapa */}
        <MapClickHandler onMapClick={onMapClick} />
        <MapUpdater latitude={latitude} longitude={longitude} />
      </MapContainer>
    </div>
  );
}