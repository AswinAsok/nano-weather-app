import { browserGeolocationService } from "./geolocationService";
import { githubRepoService } from "./githubService";
import { serverImageService } from "./imageService";
import { openWeatherService } from "./weatherService";

export const defaultServices = {
    weatherService: openWeatherService,
    githubRepoService,
    imageService: serverImageService,
    geolocationService: browserGeolocationService,
};
