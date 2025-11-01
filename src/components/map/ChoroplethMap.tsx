import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Source, type ViewState, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { toPng } from 'html-to-image';
import { Download, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type Metric = {
  value: number;
  average_score: number;
};

type ChoroplethMapProps = {
  title: string;
  description?: string;
  metricByRegion: Record<string, Metric>;
  onRegionClick?: (region: string) => void;
  height?: number;
  insight?: string;
  className?: string;
};

type RegionHover = {
  name: string;
  coordinates: [number, number];
};

const mapStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export const ChoroplethMap = ({
  title,
  description,
  metricByRegion,
  onRegionClick,
  height = 420,
  insight,
  className,
}: ChoroplethMapProps) => {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [hovered, setHovered] = useState<RegionHover | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: 54.5,
    longitude: -3.5,
    zoom: 4.5,
    bearing: 0, // 👈 Tambahkan ini
    pitch: 0, // 👈 Tambahkan ini
    padding: { top: 0, bottom: 0, left: 0, right: 0 }, // 👈 Tambahkan ini
  });

  useEffect(() => {
    const loadGeo = async () => {
      const response = await fetch('/geo/uk-regions.geo.json');
      if (!response.ok) {
        throw new Error('Gagal memuat GeoJSON region UK');
      }
      const data = (await response.json()) as GeoJSON.FeatureCollection;
      setGeojson(data);
    };
    loadGeo().catch((error) => console.error(error));
  }, []);

  const getColorStops = useMemo(() => {
    const values = Object.values(metricByRegion).map((metric) => metric.value);
    if (values.length === 0) return [0, '#dbeafe', 1, '#1d4ed8'];
    const max = Math.max(...values);
    return [0, '#0ea5e9', max * 0.5, '#3b82f6', max, '#1d4ed8'];
  }, [metricByRegion]);

  const layerStyle = useMemo(
    () => ({
      id: 'region-fill',
      type: 'fill' as const,
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'metricValue'], 0],
          ...getColorStops,
        ],
        'fill-opacity': 0.75,
      },
    }) as any,
    [getColorStops],
  );

  const outlineStyle = useMemo(
    () => ({
      id: 'region-outline',
      type: 'line' as const,
      paint: {
        'line-color': '#0f172a',
        'line-width': 0.6,
      },
    }),
    [],
  );

  const enrichedGeojson = useMemo(() => {
    if (!geojson) return null;
    return {
      ...geojson,
      features: geojson.features.map((feature) => {
        const regionName = feature.properties?.name ?? feature.properties?.NAME ?? 'Unknown';
        const key = String(regionName);
        const metric = metricByRegion[key] ?? { value: 0, average_score: 0 };
        return {
          ...feature,
          properties: {
            ...feature.properties,
            metricValue: metric.value,
            metricScore: metric.average_score,
            regionName: key,
          },
        };
      }),
    } as GeoJSON.FeatureCollection;
  }, [geojson, metricByRegion]);

  const handleDownload = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, {
      cacheBust: true,
      quality: 0.95,
      pixelRatio: 2,
    });
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleHover = useCallback((event: maplibregl.MapLayerMouseEvent) => {
    const regionName = event.features?.[0]?.properties?.regionName;
    if (!regionName || !event.lngLat) {
      setHovered(null);
      return;
    }
    setHovered({
      name: regionName,
      coordinates: [event.lngLat.lng, event.lngLat.lat],
    });
  }, []);

  const handleLeave = useCallback(() => setHovered(null), []);

  const handleClick = useCallback(
    (event: maplibregl.MapLayerMouseEvent) => {
      const regionName = event.features?.[0]?.properties?.regionName;
      if (regionName) {
        onRegionClick?.(regionName);
      }
    },
    [onRegionClick],
  );

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Button variant="ghost" size="icon" onClick={handleDownload} aria-label="Unduh PNG">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div
          ref={ref}
          className="h-full w-full overflow-hidden rounded-3xl border border-white/20 shadow-glass"
        >
          <Map
            mapLib={maplibregl}
            style={{ width: '100%', height }}
            mapStyle={mapStyle}
            initialViewState={viewState}
            onMove={(event) => setViewState(event.viewState)}
            interactiveLayerIds={['region-fill']}
            onMouseMove={handleHover}
            onMouseLeave={handleLeave}
            onClick={handleClick}
          >
            {enrichedGeojson && (
              <Source id="regions" type="geojson" data={enrichedGeojson}>
                <Layer {...layerStyle} />
                <Layer {...outlineStyle} />
              </Source>
            )}
            {hovered && (
              <Popup
                longitude={hovered.coordinates[0]}
                latitude={hovered.coordinates[1]}
                closeButton={false}
              >
                <div className="rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-white shadow-lg">
                  <p className="font-semibold">{hovered.name}</p>
                  <p>Total mahasiswa: {metricByRegion[hovered.name]?.value ?? 0}</p>
                  <p>Skor rata-rata: {metricByRegion[hovered.name]?.average_score ?? 0}</p>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </CardContent>
      {insight && (
        <CardFooter className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm text-slate-600 dark:text-slate-300">
          <MapIcon className="mt-1 h-4 w-4 text-sky-500" aria-hidden />
          <p>{insight}</p>
        </CardFooter>
      )}
    </Card>
  );
};
