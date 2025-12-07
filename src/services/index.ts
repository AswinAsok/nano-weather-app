import { browserGeolocationService } from "./geolocationService";
import { githubRepoService } from "./githubService";
import { serverImageService } from "./imageService";
import { openWeatherService } from "./weatherService";
import type { ServiceContainer } from "./contracts";

export const defaultServices: ServiceContainer = {
    weatherService: openWeatherService,
    githubRepoService,
    imageService: serverImageService,
    geolocationService: browserGeolocationService,
};
