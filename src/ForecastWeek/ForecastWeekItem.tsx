import './ForecastWeekItem.css'
import WeatherIcon from "../WeatherIcon/WeatherIcon.tsx";

type ForecastWeekItemProps = {
    day: string;
    temperature: number;
    weatherCode: number;
}
export type ForecastWeekProps = {
    days: Array<ForecastWeekItemProps>,
    state: 'NOT_LOADED' | 'LOADING' | 'LOADED' | 'ERROR';
};

export function ForecastWeekItem(props: ForecastWeekItemProps) {
    return (
        <>
            <div className={"forecast__week__item"}>
                <div className={"forecast__week__image__wrapper"}>
                    <WeatherIcon weatherCode={props.weatherCode}/>
                </div>
                <div className={"forecast__week__item__day"}>{props.day}</div>
                <div className={"forecast__week__item__temperature"}>{props.temperature}°C</div>
            </div>
            <div className={"line forecast__week__line"}></div>
        </>

    );
}
