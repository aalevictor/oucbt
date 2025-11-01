"use client";

import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Style, Fill, Stroke } from "ol/style";
import { defaults as defaultControls } from "ol/control";
import KML from "ol/format/KML";

interface MapaVisualizacaoProps {
  className?: string;
  height?: string;
}

const MapaVisualizacao: React.FC<MapaVisualizacaoProps> = ({
  className = "",
  height = "400px",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  // Função para carregar o KML
  const loadKML = async (kmlLayer: VectorLayer<VectorSource>) => {
    try {
      const response = await fetch("/shapes/perimetro.kml");
      const kmlText = await response.text();
      
      const format = new KML();
      const features = format.readFeatures(kmlText, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      // Aplicar estilo personalizado
      features.forEach((feature) => {
        feature.setStyle(
          new Style({
            fill: new Fill({
              color: 'rgba(128, 71, 155, 0.3)', // Azul claro com opacidade baixa
            }),
          })
        );
      });

      kmlLayer.getSource()?.addFeatures(features);
    } catch (error) {
      console.error("Erro ao carregar KML:", error);
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Criar camada KML
    const kmlLayer = new VectorLayer({
      source: new VectorSource(),
    });

    // Configuração inicial do mapa (sem interação)
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        kmlLayer,
      ],
      view: new View({
        center: fromLonLat([-46.595, -23.58]), // Centro do KML OUC Bairros do Tamanduateí
        zoom: 12.5,
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
    
    // Carregar KML
    loadKML(kmlLayer);

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

export default MapaVisualizacao;