import React, { useEffect, useState, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { StationPosition, Station } from '@/types/station';
import { apiClient } from '@/lib/api-client';
import StationPopup from './StationPopup';

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
  const [error, setError] = useState<string | null>(null);
  
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoadingStation, setIsLoadingStation] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [stationCoordinates, setStationCoordinates] = useState<{ lng: number; lat: number } | null>(null);

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

  const updatePopupPosition = React.useCallback(() => {
    if (mapRef.current && stationCoordinates && isPopupOpen) {
      const point = mapRef.current.project([stationCoordinates.lng, stationCoordinates.lat]);
      setPopupPosition({ x: point.x, y: point.y });
    }
  }, [stationCoordinates, isPopupOpen]);

  const fetchStationDetails = React.useCallback(async (stationId: string, lng: number, lat: number) => {
    try {
      setIsLoadingStation(true);
      setStationCoordinates({ lng, lat });
      
      // Update popup position based on coordinates
      if (mapRef.current) {
        const point = mapRef.current.project([lng, lat]);
        setPopupPosition({ x: point.x, y: point.y });
      }
      
      setIsPopupOpen(true);
      const stationDetails = await apiClient.getStationById(stationId);
      setSelectedStation(stationDetails);
    } catch (err) {
      console.error('Error fetching station details:', err);
      setError('Failed to load station details');
    } finally {
      setIsLoadingStation(false);
    }
  }, []);

  // Zoom to postal code location
  useEffect(() => {
    if (!mapRef.current || !postalCode) return;

    const map = mapRef.current;

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

    // Click handler for unclustered points - show station details
    map.on('click', 'unclustered-point', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['unclustered-point']
      });
      
      if (!features.length) return;
      
      const stationId = features[0].properties?.id;
      if (stationId && features[0].geometry && features[0].geometry.type === 'Point') {
        const [lng, lat] = features[0].geometry.coordinates;
        fetchStationDetails(stationId, lng, lat);
      }
    });

    // Click handler for map - close popup
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['unclustered-point', 'clusters']
      });
      
      // If clicking on empty map area, close popup
      if (!features.length) {
        setIsPopupOpen(false);
        setSelectedStation(null);
        setStationCoordinates(null);
      }
    });

    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });

  }, [stations, mapLoaded, fetchStationDetails]);

  // Separate useEffect to handle popup position updates
  React.useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    map.on('move', updatePopupPosition);
    map.on('zoom', updatePopupPosition);
    map.on('rotate', updatePopupPosition);
    map.on('pitch', updatePopupPosition);

    return () => {
      map.off('move', updatePopupPosition);
      map.off('zoom', updatePopupPosition);
      map.off('rotate', updatePopupPosition);
      map.off('pitch', updatePopupPosition);
    };
  }, [updatePopupPosition]);

  const zoomToStation = useCallback((stationId: string) => {
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
  }, [stations]);

  // Expose map functions to parent component
  React.useEffect(() => {
    if (onMapRef) {
      onMapRef({ zoomToStation });
    }
  }, [onMapRef, zoomToStation]);
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
      
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-20">
          {error}
        </div>
      )}
      
      {/* Station Details Popup */}
      <StationPopup
        isOpen={isPopupOpen}
        isLoading={isLoadingStation}
        station={selectedStation}
        position={popupPosition}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedStation(null);
          setStationCoordinates(null);
        }}
      />
    </div>
  );
}