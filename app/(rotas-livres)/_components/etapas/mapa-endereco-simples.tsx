"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Fill, Stroke, Circle } from "ol/style";
import { defaults as defaultControls } from "ol/control";
import KML from "ol/format/KML";
import { Loader2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isWithinOUCBTPerimeter } from "@/lib/utils/polygon-validation";

interface MapaEnderecoOpenLayersProps {
  className?: string;
}

const MapaEnderecoOpenLayers: React.FC<MapaEnderecoOpenLayersProps> = ({
  className = "",
}) => {
  const { setValue, watch } = useFormContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const kmlLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const [isLoadingReverseGeo, setIsLoadingReverseGeo] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(10);
  const [isWithinPerimeter, setIsWithinPerimeter] = useState<boolean | null>(null);

  // Observar mudanças nos campos de latitude e longitude
  const latitude = watch("endereco.latitude");
  const longitude = watch("endereco.longitude");

  // Função para validar se as coordenadas estão dentro do perímetro
  const validateCoordinates = (lat: number, lon: number): boolean => {
    const isValid = isWithinOUCBTPerimeter(lat, lon);
    setIsWithinPerimeter(isValid);
    
    if (!isValid) {
      toast.error("Este endereço está fora do perímetro de atendimento da OUCBT. Por favor, selecione um endereço dentro da área permitida.");
      // Limpar os campos de endereço quando fora do perímetro
      setValue("endereco.logradouro", "");
      setValue("endereco.numero", "");
      setValue("endereco.bairro", "");
      setValue("endereco.cidade", "");
      setValue("endereco.estado", "");
      setValue("endereco.cep", "");
      setValue("endereco.complemento", "");
    } else {
      toast.success("Endereço dentro do perímetro de atendimento!");
    }
    
    return isValid;
  };

  // Função para geocodificação reversa usando Nominatim
  // Função para converter nome do estado para sigla UF
  const getEstadoSigla = (nomeEstado: string): string => {
    const estados: { [key: string]: string } = {
      'acre': 'AC',
      'alagoas': 'AL',
      'amapá': 'AP',
      'amapa': 'AP',
      'amazonas': 'AM',
      'bahia': 'BA',
      'ceará': 'CE',
      'ceara': 'CE',
      'distrito federal': 'DF',
      'espírito santo': 'ES',
      'espirito santo': 'ES',
      'goiás': 'GO',
      'goias': 'GO',
      'maranhão': 'MA',
      'maranhao': 'MA',
      'mato grosso': 'MT',
      'mato grosso do sul': 'MS',
      'minas gerais': 'MG',
      'pará': 'PA',
      'para': 'PA',
      'paraíba': 'PB',
      'paraiba': 'PB',
      'paraná': 'PR',
      'parana': 'PR',
      'pernambuco': 'PE',
      'piauí': 'PI',
      'piaui': 'PI',
      'rio de janeiro': 'RJ',
      'rio grande do norte': 'RN',
      'rio grande do sul': 'RS',
      'rondônia': 'RO',
      'rondonia': 'RO',
      'roraima': 'RR',
      'santa catarina': 'SC',
      'são paulo': 'SP',
      'sao paulo': 'SP',
      'sergipe': 'SE',
      'tocantins': 'TO'
    };

    const nomeNormalizado = nomeEstado.toLowerCase().trim();
    return estados[nomeNormalizado] || nomeEstado.toUpperCase().substring(0, 2);
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    setIsLoadingReverseGeo(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        
        // Preencher os campos do formulário
        setValue("endereco.logradouro", address.road || address.pedestrian || "");
        setValue("endereco.numero", address.house_number || "");
        setValue("endereco.bairro", address.neighbourhood || address.suburb || "");
        setValue("endereco.cidade", address.city || address.town || address.village || "");
        setValue("endereco.estado", getEstadoSigla(address.state || ""));
        setValue("endereco.cep", address.postcode || "");
        setValue("endereco.complemento", "");
        
        toast.success("Endereço encontrado e preenchido automaticamente!");
      } else {
        toast.error("Não foi possível encontrar o endereço para esta localização.");
      }
    } catch (error) {
      console.error("Erro na geocodificação reversa:", error);
      toast.error("Erro ao buscar endereço. Tente novamente.");
    } finally {
      setIsLoadingReverseGeo(false);
    }
  };

  // Função para adicionar marcador no mapa
  const addMarker = (lat: number, lon: number) => {
    if (!markerLayerRef.current) return;

    const coordinates = fromLonLat([lon, lat]);
    const marker = new Feature({
      geometry: new Point(coordinates),
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

    const source = markerLayerRef.current.getSource();
    if (source) {
      source.clear();
      source.addFeature(marker);
    }
  };

  // Função para carregar KML
  const loadKML = async () => {
    if (!kmlLayerRef.current) return;

    try {
      const response = await fetch("/shapes/perimetro.kml");
      const kmlText = await response.text();
      
      const format = new KML();
      const features = format.readFeatures(kmlText, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      // Aplicar estilo personalizado a cada feature
      features.forEach(feature => {
        feature.setStyle(new Style({
          fill: new Fill({
            color: 'rgba(128, 71, 155, 0.3)', // Azul claro com opacidade baixa
          }),
        }));
      });

      const source = kmlLayerRef.current.getSource();
      if (source) {
        source.clear(); // Limpar features existentes
        source.addFeatures(features);
      }
    } catch (error) {
      console.error("Erro ao carregar KML:", error);
      toast.error("Erro ao carregar dados do mapa.");
    }
  };

  // Funções de zoom
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      const currentZoom = view.getZoom() || 10;
      view.animate({
        zoom: Math.min(currentZoom + 1, 19),
        duration: 250,
      });
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      const currentZoom = view.getZoom() || 10;
      view.animate({
        zoom: Math.max(currentZoom - 1, 1),
        duration: 250,
      });
    }
  };

  // Inicializar o mapa
  useEffect(() => {
    if (!mapRef.current) return;

    // Criar camada para marcadores
    markerLayerRef.current = new VectorLayer({
      source: new VectorSource(),
    });

    // Criar camada para KML
    kmlLayerRef.current = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({
          color: 'rgba(128, 71, 155, 0.3)', // Azul claro com baixa opacidade
        })
      }),
    });

    // Criar mapa
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        kmlLayerRef.current,
        markerLayerRef.current,
      ],
      view: new View({
        center: fromLonLat([-46.595, -23.58]), // Centro do KML OUC Bairros do Tamanduateí
        zoom: 12.5,
      }),
      controls: defaultControls({
        zoom: false, // Remover controles padrão de zoom
        rotate: false, // Remover controle de rotação
        attribution: true,
      }),
    });

    mapInstanceRef.current = map;

    // Listener para mudanças de zoom
    map.getView().on('change:resolution', () => {
      const zoom = map.getView().getZoom();
      if (zoom !== undefined) {
        setCurrentZoom(Math.round(zoom));
      }
    });

    // Carregar KML
    loadKML();

    // Adicionar evento de clique no mapa
    map.on("click", (event) => {
      const coordinates = toLonLat(event.coordinate);
      const [lon, lat] = coordinates;

      // Validar se está dentro do perímetro
      const isValid = validateCoordinates(lat, lon);

      // Atualizar os campos do formulário
      setValue("endereco.latitude", lat);
      setValue("endereco.longitude", lon);

      // Adicionar marcador
      addMarker(lat, lon);

      // Fazer geocodificação reversa apenas se estiver dentro do perímetro
      if (isValid) {
        reverseGeocode(lat, lon);
      }
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
      }
      mapInstanceRef.current = null;
      markerLayerRef.current = null;
      kmlLayerRef.current = null;
    };
  }, [setValue]);

  // Atualizar marcador quando latitude/longitude mudarem
  useEffect(() => {
    if (latitude && longitude && typeof latitude === "number" && typeof longitude === "number") {
      addMarker(latitude, longitude);
      // Validar se está dentro do perímetro quando as coordenadas mudarem
      validateCoordinates(latitude, longitude);
    }
  }, [latitude, longitude]);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {isLoadingReverseGeo && (
          <div className="absolute top-2 right-2 z-10 bg-white rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando endereço...
            </div>
          </div>
        )}

        {/* Controles de Zoom Personalizados */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white hover:bg-gray-50 shadow-lg"
            onClick={zoomIn}
            disabled={currentZoom >= 19}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white hover:bg-gray-50 shadow-lg"
            onClick={zoomOut}
            disabled={currentZoom <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>

        {/* Container do mapa OpenLayers */}
        <div 
          ref={mapRef}
          className="h-96 w-full rounded-lg border overflow-hidden"
          style={{ minHeight: "384px" }}
        />

        {/* Coordenadas e Status do Perímetro */}
        {latitude && longitude && (
          <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-2 shadow-lg z-10">
            <p className="text-xs text-gray-600">
              Lat: {latitude.toFixed(6)}<br />
              Lng: {longitude.toFixed(6)}
            </p>
            {isWithinPerimeter !== null && (
              <div className={`mt-1 text-xs font-medium ${
                isWithinPerimeter 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {isWithinPerimeter 
                  ? '✓ Dentro do perímetro' 
                  : '✗ Fora do perímetro'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapaEnderecoOpenLayers;