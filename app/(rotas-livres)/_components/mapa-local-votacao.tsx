"use client";

import React, { useEffect, useRef } from "react";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Style, Fill, Stroke, Circle } from "ol/style";
import { defaults as defaultControls } from "ol/control";
import { Point } from "ol/geom";
import { MapIcon } from "lucide-react";

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
  const lat = -23.5975570024;
  const lon = -46.621155865;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const lonlat = fromLonLat([lon, lat]);
    const markersSource = new VectorSource();
    const marker = new Feature({
      geometry: new Point(lonlat),
    });
    marker.setStyle(
      new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: "#ef4444" }),
          stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
      })
    );
    markersSource.addFeature(marker);
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
        zoom: 17,
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
    <div className="relative w-full" style={{ height }}>
      <div 
        ref={mapRef} 
        className={`w-full h-full border border-border rounded-lg ${className}`}
      />
      <a
        href={`https://maps.app.goo.gl/9Vigzh86jkWrLtEM8`}
        onClick={(e) => {
          e.preventDefault();
          const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
          const isIOS = /iPad|iPhone|iPod/i.test(ua);
          let url = `https://maps.app.goo.gl/9Vigzh86jkWrLtEM8`;
          if (isIOS) {
            url = `maps://?q=${lat},${lon}`;
          }
          window.open(url, '_blank');
        }}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 px-2.5 py-2 bg-background text-foreground border rounded-md shadow-sm hover:bg-muted z-10 flex items-center gap-2"
        aria-label="Abrir no app de mapas"
      >
        Abrir no mapa
      </a>
    </div>
  );
};

export default MapaLocalVotacao;