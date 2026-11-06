import raw from '$lib/data/ubigeo-server.json';
import type { ClimateZone, Location } from '$lib/types';

type Row = [string, string, string, string, number, number, number, ClimateZone];

const rows = raw as Row[];
const byUbigeo = new Map<string, Location>(
  rows.map(([ubigeo, departamento, provincia, distrito, lat, lon, altitud, zona]) => [
    ubigeo,
    { ubigeo, departamento, provincia, distrito, lat, lon, altitud, zona }
  ])
);

export function getLocation(ubigeo: string): Location | undefined {
  return byUbigeo.get(ubigeo);
}

export function listUbigeos(): string[] {
  return [...byUbigeo.keys()];
}

export function featuredUbigeos(): string[] {
  return ['150101', '200104', '160101', '040101', '080101', '130101', '010101', '070101'];
}
