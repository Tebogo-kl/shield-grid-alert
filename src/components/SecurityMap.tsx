import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Shield, RefreshCw, Locate } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const API_BASE_URL = 'https://localhost:44339/api';
const GEOAPIFY_API_KEY = 'c1ee18d603cc487f814d34e2263302e7';

interface Officer {
  id: string;
  name: string;
  company: string;
  rating: number;
  distance: string;
  estimatedArrival: string;
  specialization: string;
  status: string;
  location: { lat: number; lng: number };
}

interface SecurityMapProps {
  userLocation: { lat: number; lng: number };
  selectedService: string;
}

const SecurityMap: React.FC<SecurityMapProps> = ({ userLocation, selectedService }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Load Leaflet CSS and JS
  useEffect(() => {
    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const linkElement = document.createElement('link');
      linkElement.id = 'leaflet-css';
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);
    }

    // Add Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

    const L = window.L;

    // Initialize the map
    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: true,
    });

    // Add Geoapify tile layer
    L.tileLayer(
      `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.geoapify.com/">Geoapify</a>',
        maxZoom: 20,
      }
    ).addTo(map);

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div style="position: relative;">
          <div style="width: 20px; height: 20px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
          <div style="position: absolute; top: -4px; left: -4px; width: 28px; height: 28px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<strong>Your Location</strong>');

    mapRef.current = map;

    // Add custom CSS for pulse animation
    if (!document.getElementById('map-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'map-custom-styles';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .user-marker, .officer-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .officer-popup {
          min-width: 200px;
        }
        .officer-popup h3 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
        }
        .officer-popup p {
          margin: 2px 0;
          font-size: 12px;
          color: #666;
        }
        .officer-popup .status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
          margin-top: 4px;
        }
        .officer-popup .status.available {
          background: #22c55e;
          color: white;
        }
        .officer-popup .status.responding {
          background: #eab308;
          color: white;
        }
        .officer-popup .status.busy {
          background: #ef4444;
          color: white;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded, userLocation]);

  // Fetch officers
  useEffect(() => {
    fetchAvailableOfficers();
  }, [selectedService]);

  // Update officer markers when officers change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const L = window.L;

    // Clear existing officer markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add officer markers
    const visibleOfficers = officers.filter(
      (officer) => officer.status === 'available' || officer.status === 'responding'
    );

    visibleOfficers.forEach((officer) => {
      const statusColor = officer.status === 'available' ? '#22c55e' : 
                         officer.status === 'responding' ? '#eab308' : '#6b7280';

      const officerIcon = L.divIcon({
        className: 'officer-marker',
        html: `
          <div style="position: relative; cursor: pointer;">
            <div style="width: 32px; height: 32px; background: ${statusColor}; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            ${officer.status === 'available' ? `
              <div style="position: absolute; top: -2px; left: -2px; width: 36px; height: 36px; background: rgba(34, 197, 94, 0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
            ` : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupContent = `
        <div class="officer-popup">
          <h3>${officer.name}</h3>
          <p>${officer.company}</p>
          <p style="color: #3b82f6;">${officer.specialization}</p>
          <p><strong>${officer.distance}</strong> away • ETA: ${officer.estimatedArrival}</p>
          <p>⭐ ${officer.rating}</p>
          <span class="status ${officer.status}">${officer.status.toUpperCase()}</span>
        </div>
      `;

      const marker = L.marker([officer.location.lat, officer.location.lng], { icon: officerIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent);

      marker.on('click', () => {
        setSelectedOfficer(officer);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers if there are officers
    if (visibleOfficers.length > 0) {
      const allPoints = [
        [userLocation.lat, userLocation.lng],
        ...visibleOfficers.map(o => [o.location.lat, o.location.lng])
      ];
      
      // Only fit bounds if we have multiple points spread out
      const bounds = L.latLngBounds(allPoints as [number, number][]);
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [officers, mapLoaded]);

  const fetchAvailableOfficers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // Try to fetch from API
      const response = await fetch(`${API_BASE_URL}/securityofficers/available`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const officersData = await response.json();

        const formattedOfficers = (officersData || []).map((officer: any) => {
          const randomDistance = (Math.random() * 5 + 0.5).toFixed(1);
          const estimatedMinutes = Math.floor(Math.random() * 20 + 5);

          return {
            id: officer.id,
            name: `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || 'Unknown Officer',
            company: officer.companyName || 'Security Company',
            rating: officer.rating || (4 + Math.random()).toFixed(1),
            distance: `${randomDistance} km`,
            estimatedArrival: `${estimatedMinutes} min`,
            specialization: officer.specializations?.[0] || 'General Security',
            status: officer.status?.toLowerCase() || 'available',
            location: {
              lat: officer.currentLatitude || userLocation.lat + (Math.random() - 0.5) * 0.02,
              lng: officer.currentLongitude || userLocation.lng + (Math.random() - 0.5) * 0.02,
            },
          };
        });

        setOfficers(formattedOfficers);
      } else {
        // Use demo data if API fails
        setOfficers(generateDemoOfficers());
      }
    } catch (error) {
      console.error('Error fetching available officers:', error);
      // Use demo data on error
      setOfficers(generateDemoOfficers());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoOfficers = (): Officer[] => {
    const demoData = [
      { name: 'John Mabaso', company: 'SecureGuard SA', specialization: 'Armed Response' },
      { name: 'Sarah Nkosi', company: 'ProtectAll Security', specialization: 'Patrol' },
      { name: 'David van der Merwe', company: 'SafeZone Security', specialization: 'Surveillance' },
      { name: 'Thabo Mokoena', company: 'SecureGuard SA', specialization: 'Emergency Response' },
      { name: 'Lisa Pretorius', company: 'Elite Protection', specialization: 'Escort Services' },
    ];

    return demoData.map((data, index) => ({
      id: `demo-${index}`,
      name: data.name,
      company: data.company,
      rating: (4 + Math.random()).toFixed(1) as unknown as number,
      distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
      estimatedArrival: `${Math.floor(Math.random() * 15 + 5)} min`,
      specialization: data.specialization,
      status: index < 3 ? 'available' : 'responding',
      location: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.025,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.025,
      },
    }));
  };

  const centerOnUser = () => {
    if (mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'responding': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const visibleOfficers = officers.filter(
    (officer) => officer.status === 'available' || officer.status === 'responding'
  );

  if (!mapLoaded) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Badge className="bg-white/95 text-gray-800 shadow-md">
          <MapPin className="h-3 w-3 mr-1" />
          Live Security Map
        </Badge>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 rounded-lg p-3 text-xs shadow-md">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available ({visibleOfficers.filter((o) => o.status === 'available').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Responding ({visibleOfficers.filter((o) => o.status === 'responding').length})</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-2">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/95 shadow-md"
          onClick={centerOnUser}
        >
          <Locate className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/95 shadow-md"
          onClick={fetchAvailableOfficers}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Service Filter Indicator */}
      {selectedService && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-blue-500 text-white px-3 py-1 rounded-full text-sm shadow-md">
          Showing: {selectedService.replace('_', ' ')}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-[999] flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-gray-600">Loading officers...</p>
          </div>
        </div>
      )}

      {/* No Officers Message */}
      {!loading && visibleOfficers.length === 0 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-white/95 rounded-lg p-4 text-center shadow-lg">
            <Shield className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No officers available nearby</p>
            <button
              onClick={fetchAvailableOfficers}
              className="text-xs text-blue-600 mt-2 hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Selected Officer Card */}
      {selectedOfficer && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-16 md:w-72 z-[1000] bg-white rounded-lg p-4 shadow-lg">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => setSelectedOfficer(null)}
          >
            ×
          </button>
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-full ${getStatusColor(selectedOfficer.status)} flex items-center justify-center`}>
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{selectedOfficer.name}</h3>
              <p className="text-sm text-gray-600">{selectedOfficer.company}</p>
              <p className="text-xs text-blue-600">{selectedOfficer.specialization}</p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-gray-600">{selectedOfficer.distance} away</span>
                <span className="text-gray-600">ETA: {selectedOfficer.estimatedArrival}</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-yellow-500">★</span>
                <span className="text-xs text-gray-600 ml-1">{selectedOfficer.rating}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extend Window interface for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export default SecurityMap;