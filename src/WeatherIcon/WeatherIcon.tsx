import {WeatherCodeMapper} from "./WeatherCodeMapper.ts";

function WeatherIcon(props: { weatherCode: number }) {
    const icon = WeatherCodeMapper.getIcon(props.weatherCode);
    const description = WeatherCodeMapper.getDescription(props.weatherCode);
    return (
        <img src={icon} alt={description}/>
    )
}

export default WeatherIcon;
