/** Request browser geolocation for attendance. Never blocks check-in if denied. */
export type GeoPayload = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
};

export function getCurrentPosition(): Promise<GeoPayload> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ latitude: null, longitude: null, accuracy: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => resolve({ latitude: null, longitude: null, accuracy: null }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}
