import type { Coordinates, GeolocationService } from "./contracts";

class BrowserGeolocationService implements GeolocationService {
    async getCurrentPosition(options?: PositionOptions): Promise<Coordinates> {
        if (!navigator.geolocation) {
            throw new Error("Location is not supported in this browser.");
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                },
                options
            );
        });
    }
}

export const browserGeolocationService: GeolocationService = new BrowserGeolocationService();
