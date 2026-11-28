/**
 * React Hook for Offline Data Management
 * Automatically handles fetching from API or using cached data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCachedServices,
  getCachedEmergencyGuides,
  getCachedOrganizations
} from '../lib/db';
import {
  fetchAndCacheServices,
  fetchAndCacheEmergencyGuides,
  fetchAndCacheOrganizations
} from '../lib/syncManager';

/**
 * Hook for fetching services (online or cached)
 */
export function useServices(filters = {}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'api' or 'cache'

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        // Try fetching from API
        const result = await fetchAndCacheServices();
        if (result.success) {
          setSource('api');
        }
      }

      // Always load from cache (either newly cached or existing)
      const cached = await getCachedServices(filters);
      setServices(cached);
      if (!source) setSource('cache');
    } catch (err) {
      setError(err.message);
      // Fallback to cache
      const cached = await getCachedServices(filters);
      setServices(cached);
      setSource('cache');
    } finally {
      setLoading(false);
    }
  }, [filters, source]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, source, refresh: fetchServices };
}

/**
 * Hook for fetching emergency guides (online or cached)
 */
export function useEmergencyGuides(filters = {}) {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const fetchGuides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        const result = await fetchAndCacheEmergencyGuides();
        if (result.success) {
          setSource('api');
        }
      }

      const cached = await getCachedEmergencyGuides(filters);
      setGuides(cached);
      if (!source) setSource('cache');
    } catch (err) {
      setError(err.message);
      const cached = await getCachedEmergencyGuides(filters);
      setGuides(cached);
      setSource('cache');
    } finally {
      setLoading(false);
    }
  }, [filters, source]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  return { guides, loading, error, source, refresh: fetchGuides };
}

/**
 * Hook for fetching organizations (online or cached)
 */
export function useOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.onLine) {
        const result = await fetchAndCacheOrganizations();
        if (result.success) {
          setSource('api');
        }
      }

      const cached = await getCachedOrganizations();
      setOrganizations(cached);
      if (!source) setSource('cache');
    } catch (err) {
      setError(err.message);
      const cached = await getCachedOrganizations();
      setOrganizations(cached);
      setSource('cache');
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return { organizations, loading, error, source, refresh: fetchOrganizations };
}
