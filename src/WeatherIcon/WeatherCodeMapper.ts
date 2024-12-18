import Sunny from "./assets/sunny.svg";
import MainlySunny from "./assets/mainly-sunny.svg";
import PartlyCloudy from "./assets/partly-cloudy.svg";
import Cloudy from "./assets/cloudy.svg";
import Thunderstorm from "./assets/thunderstorm.svg";

export class WeatherCodeMapper {
    
    // Probably it wouldn't make sens to create around 80 icons for each weather code.
    // In this case I will use ranges instead of exact values.
    static getIcon(weatherCode: number): string {
        // Values are artificial and do not correspond to real weather codes
        if(1 <= weatherCode && weatherCode <= 10) {
            return Sunny
        }
        if(11 <= weatherCode && weatherCode <= 20) {
            return MainlySunny
        }
        if(21 <= weatherCode && weatherCode <= 30) {
            return PartlyCloudy
        }
        if(31 <= weatherCode && weatherCode <= 40) {
            return Cloudy
        }
        if(41 <= weatherCode && weatherCode <= 50) {
            return Thunderstorm
        }
        
        return PartlyCloudy
    }

    // With this method we could generate more precise descriptions of the weather
    static getDescription(weatherCode: number): string {
        switch (weatherCode) {
            case 1:
                return 'Sunny';
            case 2:
                return 'Mainly Sunny';
            case 3:
                return 'Partly Cloudy';
            case 4:
                return 'Cloudy';
            case 5:
                return 'Thunderstorm';
            case 61:
                return 'Rain'
            // ... and so on
            default:
                return 'Unknown weather';
        }
    }
}
