import './ForecastToday.css'
import WeatherIcon from "../WeatherIcon/WeatherIcon.tsx";

export type ForecastTodayProps = {
    day: string;
    time: string;
    temperature: number;
    cityName: string;
    weatherCode: number;
    state: 'NOT_LOADED' | 'LOADING' | 'LOADED' | 'ERROR';
}

export function ForecastToday(props: ForecastTodayProps) {
    return (
        <div className={"forecast__today"}>
            <div className={"forecast__today__image__wrapper"}>
                <WeatherIcon weatherCode={props.weatherCode}/>
            </div>
            <div className={"forecast__today__info__wrapper"}>
                <div className={"forecast__today__info__temperature"}>{props.temperature} °C</div>
                <div className={"forecast__today__info__city"}>{props.cityName}</div>
                <div className={"forecast__today__info__day"}>{props.day} {props.time}</div>
            </div>
        </div>
    );
}
