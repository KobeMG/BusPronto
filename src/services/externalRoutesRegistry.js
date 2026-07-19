import { getExternalStops, getExternalStopDetails } from './externalRoute.service';

const SUPPORTED_ROUTES = ['alajuela', 'heredia', 'alajuelita'];

const registry = Object.fromEntries(
  SUPPORTED_ROUTES.map(route => [
    route,
    {
      getStops: () => getExternalStops(route),
      getStopDetails: (stopId) => getExternalStopDetails(route, stopId),
    },
  ])
);

export const getExternalService = (routeId) => {
  if (!routeId) throw new Error('ROUTE_ID_REQUIRED');

  const normalizedRouteId = routeId.toLowerCase();
  const service = registry[normalizedRouteId];

  if (!service) {
    throw new Error('ROUTE_NOT_SUPPORTED');
  }

  return service;
};
