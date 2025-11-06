"use client";

import React, { useEffect, useRef } from "react";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Style, Fill, Stroke } from "ol/style";
import { defaults as defaultControls } from "ol/control";
import KML from "ol/format/KML";
import { Point } from "ol/geom";

interface MapaLocalVotacaoProps {
  className?: string;
  height?: string;
}

const MapaLocalVotacao: React.FC<MapaLocalVotacaoProps> = ({
  className = "",
  height = "400px",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const lonlat = fromLonLat([-46.6212, -23.5978]);
    const markersSource = new VectorSource();
    markersSource.addFeature(
      new Feature({
        geometry: new Point(lonlat),
      })
    );
    const markersLayer = new VectorLayer({
      source: markersSource,
    });

    // Configuração inicial do mapa (sem interação)
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        markersLayer,
      ],
      view: new View({
        center: lonlat, // Centro do KML OUC Bairros do Tamanduateí
        zoom: 16,
      }),
      controls: defaultControls({
        attribution: false,
        zoom: true,
        rotate: false,
      }),
      // Manter interações de zoom e pan, mas sem seleção
    });

    // Adicionar controles de zoom personalizados
    map.getControls().clear();

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={`w-full border border-border rounded-lg ${className}`}
      style={{ height }}
    />
  );
};

export default MapaLocalVotacao;