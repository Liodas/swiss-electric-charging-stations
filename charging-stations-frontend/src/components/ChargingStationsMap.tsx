import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StationPosition } from '@/types/station';
import { apiClient } from '@/lib/api-client';

interface ChargingStationsMapProps {
  postalCode?: string;
  onMapRef?: (mapRef: { zoomToStation: (stationId: string) => void }) => void;
}

export default function ChargingStationsMap({ postalCode, onMapRef }: ChargingStationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [stations, setStations] = useState<StationPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setError] = useState<string | null>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.your-mapbox-token-here';

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'pk.your-mapbox-token-here') {
      setError('Mapbox access token not configured. Please add your token to .env.local');
      setIsLoading(false);

      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [8.2275, 46.8182],
      zoom: 7,
      maxBounds: [
        [5.9559, 45.8179],
        [10.4921, 47.8084]
      ],
      minZoom: 6.5
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.on('load', () => {
      setMapLoaded(true);
    });
    
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [MAPBOX_TOKEN]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiClient.getStations();
        setStations(response || []);
      } catch (err) {
        setError('Failed to load charging stations');
        console.error('Error fetching stations:', err);
        setStations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Zoom to postal code location
  useEffect(() => {
    if (!mapRef.current || !postalCode) return;

    const map = mapRef.current;

    // Use Mapbox Geocoding API to find the postal code location
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postalCode}.json?country=CH&types=postcode&access_token=${MAPBOX_TOKEN}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          map.flyTo({
            center: [lng, lat],
            zoom: 12,
            duration: 1500
          });
        }
      })
      .catch(err => {
        console.error('Error geocoding postal code:', err);
      });
  }, [postalCode, MAPBOX_TOKEN]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !stations.length) return;

    const map = mapRef.current;

    // Convert stations to GeoJSON format
    const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features: stations
        .filter(s => s.latitude && s.longitude)
        .map(station => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [station.longitude, station.latitude]
          },
          properties: {
            id: station.id,
            latitude: station.latitude,
            longitude: station.longitude
          }
        }))
    };

    // Remove existing source and layers if they exist
    if (map.getSource('stations')) {
      if (map.getLayer('clusters')) map.removeLayer('clusters');
      if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
      if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
      map.removeSource('stations');
    }

    // Add GeoJSON source with clustering
    map.addSource('stations', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Cluster circles
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'stations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#06b6d4', 100,
          '#8b5cf6', 500,
          '#f59e0b', 1000,
          '#ef4444'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          22, 100,
          32, 500,
          42, 1000,
          52
        ],
        'circle-opacity': 0.9,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.8
      }
    });

    // Cluster count labels
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'stations',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0, 0, 0, 0.3)',
        'text-halo-width': 1
      }
    });

    // Individual points
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'stations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#3b82f6',
        'circle-radius': 7,
        'circle-opacity': 0.95,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.9
      }
    });

    // Click handler for clusters - zoom in
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      
      if (!features.length) return;
      
      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource('stations') as mapboxgl.GeoJSONSource;
      
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !features[0].geometry || features[0].geometry.type !== 'Point') return;

        map.easeTo({
          center: features[0].geometry.coordinates as [number, number],
          zoom: zoom || (map.getZoom() + 2)
        });
      });
    });

    // Change cursor on hover for clusters only
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });

  }, [stations, mapLoaded]);

  const zoomToStation = (stationId: string) => {
    if (!mapRef.current) return;

    const stationWithCoords = stations.find(s => s.id === stationId);
    
    if (stationWithCoords) {
      const map = mapRef.current;
      map.flyTo({
        center: [stationWithCoords.longitude, stationWithCoords.latitude],
        zoom: 15,
        duration: 1500
      });
    }
  };

  // Expose map functions to parent component
  React.useEffect(() => {
    if (onMapRef) {
      onMapRef({ zoomToStation });
    }
  }, [onMapRef, stations]);
  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading stations...</span>
          </div>
        </div>
      )}
    </div>
  );
}