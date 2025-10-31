import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { KML } from 'ol/format';
import { Style, Stroke, Fill } from 'ol/style';

export interface KMLLayerOptions {
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  fillOpacity?: number;
}

/**
 * Carrega um arquivo KML e retorna uma layer do OpenLayers
 * @param kmlUrl URL do arquivo KML
 * @param options Opções de estilo para a layer
 * @returns Promise<VectorLayer<VectorSource>>
 */
export async function loadKMLLayer(
  kmlUrl: string, 
  options: KMLLayerOptions = {}
): Promise<VectorLayer<VectorSource>> {
  try {
    // Fazer download do arquivo KML
    const response = await fetch(kmlUrl);
    if (!response.ok) {
      throw new Error(`Erro ao carregar KML: ${response.statusText}`);
    }
    
    const kmlContent = await response.text();
    
    // Criar o formato KML do OpenLayers
    const kmlFormat = new KML({
      extractStyles: false // Vamos usar nossos próprios estilos
    });
    
    // Parsear o KML
    const features = kmlFormat.readFeatures(kmlContent, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    
    // Criar a fonte de dados vetoriais
    const vectorSource = new VectorSource({
      features: features
    });
    
    // Definir estilos padrão
    const defaultStyle = new Style({
      stroke: new Stroke({
        color: options.strokeColor || '#3B82F6',
        width: options.strokeWidth || 2
      }),
      fill: new Fill({
        color: `rgba(59, 130, 246, ${options.fillOpacity || 0.1})`
      })
    });
    
    // Criar a layer vetorial
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: defaultStyle
    });
    
    return vectorLayer;
    
  } catch (error) {
    console.error('Erro ao carregar KML:', error);
    throw error;
  }
}

/**
 * Carrega múltiplas layers KML
 * @param kmlUrls Array de URLs dos arquivos KML
 * @param options Opções de estilo (aplicadas a todas as layers)
 * @returns Promise<VectorLayer<VectorSource>[]>
 */
export async function loadMultipleKMLLayers(
  kmlUrls: string[], 
  options: KMLLayerOptions = {}
): Promise<VectorLayer<VectorSource>[]> {
  const promises = kmlUrls.map(url => loadKMLLayer(url, options));
  return Promise.all(promises);
}

/**
 * Carrega um KML e retorna apenas as features (sem criar layer)
 * @param kmlUrl URL do arquivo KML
 * @returns Promise<Feature[]>
 */
export async function loadKMLFeatures(kmlUrl: string) {
  try {
    const response = await fetch(kmlUrl);
    if (!response.ok) {
      throw new Error(`Erro ao carregar KML: ${response.statusText}`);
    }
    
    const kmlContent = await response.text();
    
    const kmlFormat = new KML({
      extractStyles: false
    });
    
    const features = kmlFormat.readFeatures(kmlContent, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    
    return features;
    
  } catch (error) {
    console.error('Erro ao carregar features do KML:', error);
    throw error;
  }
}