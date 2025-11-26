import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for user and restaurants
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Restaurant {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distance: number;
}

interface LocationMapProps {
  userLat: number;
  userLng: number;
  restaurants: Restaurant[];
  onRefreshLocation?: () => void;
  isLoadingLocation?: boolean;
}

// Component to fit bounds
function FitBounds({ userLat, userLng, restaurants }: { userLat: number; userLng: number; restaurants: Restaurant[] }) {
  const map = useMap();

  useEffect(() => {
    if (restaurants.length === 0) {
      map.setView([userLat, userLng], 13);
      return;
    }

    const bounds = L.latLngBounds([
      [userLat, userLng],
      ...restaurants.map(r => [r.lat, r.lng] as [number, number])
    ]);

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, userLat, userLng, restaurants]);

  return null;
}

export function LocationMap({
  userLat,
  userLng,
  restaurants,
  onRefreshLocation,
  isLoadingLocation = false,
}: LocationMapProps) {
  const { t } = useLanguage();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('map.locationMap')}
          </CardTitle>
          {onRefreshLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshLocation}
              disabled={isLoadingLocation}
            >
              <Navigation className={`w-4 h-4 mr-2 ${isLoadingLocation ? 'animate-spin' : ''}`} />
              {t('map.refreshLocation')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Interactive Map */}
          <div className="relative w-full h-96 rounded-lg overflow-hidden border border-border">
            <MapContainer
              center={[userLat, userLng]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User Location Marker */}
              <Marker position={[userLat, userLng]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <strong className="text-blue-600">📍 {t('map.yourLocation')}</strong>
                    <p className="text-xs mt-1">
                      {userLat.toFixed(4)}, {userLng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Restaurant Markers */}
              {restaurants.map((restaurant, index) => (
                <Marker
                  key={restaurant.id}
                  position={[restaurant.lat, restaurant.lng]}
                  icon={restaurantIcon}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <strong className="text-red-600">🍽️ {restaurant.name}</strong>
                      <p className="text-xs mt-1">
                        📏 {t('map.distanceFromYou', { distance: restaurant.distance.toFixed(1) })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{index + 1} trong danh sách
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Fit bounds to show all markers */}
              <FitBounds userLat={userLat} userLng={userLng} restaurants={restaurants} />
            </MapContainer>
          </div>

          {/* Restaurant List */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">
              {t('map.nearbyRestaurants', { count: restaurants.length })}
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {restaurants.slice(0, 10).map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{restaurant.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {restaurant.distance.toFixed(1)} km
                  </span>
                </div>
              ))}
              {restaurants.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {t('map.andMore', { count: restaurants.length - 10 })}
                </p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{t('map.yourLocation')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{t('map.restaurant')}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
            <p className="font-medium mb-1">💡 {t('map.instructions')}</p>
            <ul className="list-disc list-inside space-y-1">
              {(t('map.instructionsList', { returnObjects: true }) as string[]).map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

