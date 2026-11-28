import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { WifiOff, Download, CheckCircle, AlertCircle } from "lucide-react";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const KAKUMA_CENTER = [3.7307854, 34.841857];

// Offline map tile cache key
const TILE_CACHE_KEY = "aidlink:map-tiles";
const CACHE_VERSION = "v1";

function ServiceMap({ services }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStatus, setCacheStatus] = useState("checking");
  const [tileProvider, setTileProvider] = useState("online");

  useEffect(() => {
    // Monitor online/offline status
    function handleOnline() {
      setIsOnline(true);
      setTileProvider("online");
    }

    function handleOffline() {
      setIsOnline(false);
      setTileProvider("offline");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check if map tiles are cached
    checkTileCache();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function checkTileCache() {
    if (!("caches" in window)) {
      setCacheStatus("unavailable");
      return;
    }

    try {
      const cache = await caches.open(`${TILE_CACHE_KEY}-${CACHE_VERSION}`);
      const keys = await cache.keys();
      setCacheStatus(keys.length > 0 ? "cached" : "empty");
    } catch (error) {
      console.error("Failed to check tile cache:", error);
      setCacheStatus("error");
    }
  }

  async function downloadMapTiles() {
    if (!("caches" in window)) {
      alert("Your browser does not support offline maps.");
      return;
    }

    setCacheStatus("downloading");

    try {
      const cache = await caches.open(`${TILE_CACHE_KEY}-${CACHE_VERSION}`);
      const zoom = 12;
      const centerTile = latLngToTile(KAKUMA_CENTER[0], KAKUMA_CENTER[1], zoom);

      // Download 5x5 grid of tiles around center
      const radius = 2;
      const tiles = [];

      for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
          const tileX = centerTile.x + x;
          const tileY = centerTile.y + y;
          const url = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
          tiles.push(url);
        }
      }

      // Download tiles
      await Promise.all(
        tiles.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (error) {
            console.warn(`Failed to cache tile: ${url}`, error);
          }
        })
      );

      setCacheStatus("cached");
      alert("Map tiles downloaded successfully! You can now view the map offline.");
    } catch (error) {
      console.error("Failed to download map tiles:", error);
      setCacheStatus("error");
      alert("Failed to download map tiles. Please try again.");
    }
  }

  function latLngToTile(lat, lng, zoom) {
    const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom)
    );
    return { x, y };
  }

  const mappedServices = services.filter(
    (service) =>
      service.verified === true &&
      Array.isArray(service.coordinates) &&
      service.coordinates.length === 2 &&
      service.coordinates.every(Number.isFinite)
  );

  // Choose tile URL based on online status and cache
  const tileUrl =
    !isOnline && cacheStatus === "cached"
      ? `https://tile.openstreetmap.org/{z}/{x}/{y}.png` // Service worker will intercept and serve from cache
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="service-map-wrapper">
      <div className="service-map-heading">
        <h3>Explore Kakuma</h3>
        <p>Interactive area map</p>
      </div>

      {!isOnline && (
        <div className="map-offline-notice">
          <WifiOff size={20} />
          <span>
            {cacheStatus === "cached"
              ? "Offline mode - Showing cached map"
              : "No internet connection. Map tiles unavailable."}
          </span>
        </div>
      )}

      {isOnline && cacheStatus !== "cached" && cacheStatus !== "downloading" && (
        <div className="map-download-prompt">
          <Download size={20} />
          <div>
            <p>
              <strong>Download map for offline use</strong>
            </p>
            <p>Cache map tiles to view the map without internet connection</p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={downloadMapTiles}
          >
            Download Map
          </button>
        </div>
      )}

      {cacheStatus === "downloading" && (
        <div className="map-downloading-notice">
          <AlertCircle size={20} />
          <span>Downloading map tiles... This may take a minute.</span>
        </div>
      )}

      {cacheStatus === "cached" && (
        <div className="map-cached-notice">
          <CheckCircle size={20} />
          <span>Map available offline</span>
        </div>
      )}

      <MapContainer
        center={KAKUMA_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="service-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
          maxZoom={19}
          minZoom={10}
        />

        {mappedServices.map((service) => (
          <Marker
            key={service.id}
            position={service.coordinates}
          >
            <Popup>
              <div className="map-popup-content">
                <strong>{service.name}</strong>
                <p>{service.area}</p>
                <p className="service-category">{service.category}</p>
                <Link to={`/services/${service.id}`} className="popup-link">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-info">
        <p className="map-status">
          {isOnline ? (
            <span className="status-online">
              <CheckCircle size={16} />
              Online
            </span>
          ) : (
            <span className="status-offline">
              <WifiOff size={16} />
              Offline
            </span>
          )}
        </p>
        <p className="map-disclaimer">
          {mappedServices.length === 0
            ? "No verified location pins available yet."
            : `Showing ${mappedServices.length} verified service location${
                mappedServices.length === 1 ? "" : "s"
              }.`}
          {!isOnline && cacheStatus !== "cached" &&
            " Map requires internet connection or cached tiles."}
        </p>
      </div>
    </div>
  );
}

export default ServiceMap;
