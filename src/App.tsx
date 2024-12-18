import './App.css'
import {fetchWeatherApi} from 'openmeteo';
import React, {useState} from "react";
import {ForecastToday, ForecastTodayProps} from "./ForecastToday/ForecastToday.tsx";
import {ForecastWeekProps, ForecastWeekItem} from "./ForecastWeek/ForecastWeekItem.tsx";
import SearchIcon from './search.svg';


function App() {

    const [forecastToday, setForecastToday] = useState<ForecastTodayProps>({
        day: '',
        time: '',
        temperature: 0,
        cityName: '',
        weatherCode: 0,
        state: 'NOT_LOADED'
    });

    const [forecastWeek, setForecastWeek] = useState<ForecastWeekProps>({
        days: [],
        state: 'NOT_LOADED'
    })

    const mapCurrentWeatherForecast =
        (current: any, utcOffsetSeconds: number, cityName: string): ForecastTodayProps => {
            const date = new Date((Number(current.time()) + utcOffsetSeconds) * 1000);

            return {
                day: date.toLocaleDateString('en-US', {weekday: 'long'}),
                time: date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
                temperature: Number(current.variables(0)!.value().toFixed(0)),
                cityName: cityName,
                weatherCode: current.variables(1)!.value(),
                state: 'LOADED'
            }
        }

    const mapForecastWeek = (daily: any, utcOffsetSeconds: number): ForecastWeekProps => {
        const range = (start: number, stop: number, step: number) =>
            Array.from({length: (stop - start) / step}, (_, i) => start + i * step);

        const temperatureMaxArray = daily.variables(1)!.valuesArray()!;
        const temperatureMinArray = daily.variables(2)!.valuesArray()!;
        const weatherCodeArray = daily.variables(0)!.valuesArray()!;
        const dateArray = range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
            (t) => new Date((t + utcOffsetSeconds) * 1000)
        );

        return {
            days: dateArray
                .slice(1)
                .map((time, index) => {
                    return {
                        day: time.toLocaleDateString('en-US', {weekday: 'long'}),
                        // TODO: Which temperature should be displayed here?
                        temperature: Number(
                            ((temperatureMaxArray[index] + temperatureMinArray[index]) / 2).toFixed(0)
                        ),
                        weatherCode: weatherCodeArray[index]
                    }
                }),
            state: 'LOADED'
        };
    }

    const searchForForecastByCityName = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const form = e.currentTarget;
            const formData = new FormData(form);
            const cityName = formData.get('cityName')! as string;

            const geocodingRequestParams = {
                name: cityName
            }

            const geocodingResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${geocodingRequestParams.name}&count=1&language=en&format=json`)
            const geocoding = await geocodingResponse.json();
            const geocodingResult = geocoding.results[0];
            const lat = geocodingResult.latitude;
            const lon = geocodingResult.longitude;

            const forecastRequestParams = {
                latitude: [lat],
                longitude: [lon],
                current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min',
                forecast_days: 6
            };
            const url = 'https://api.open-meteo.com/v1/forecast';
            const forecastResponses = await fetchWeatherApi(url, forecastRequestParams);
            const forecastResponse = forecastResponses[0];
            const utcOffsetSeconds = forecastResponse.utcOffsetSeconds();

            setForecastToday(mapCurrentWeatherForecast(forecastResponse.current()!, utcOffsetSeconds, cityName));
            setForecastWeek(mapForecastWeek(forecastResponse.daily()!, utcOffsetSeconds))
        } catch (e) {
            console.error(e);
            setForecastToday({
                day: '',
                time: '',
                temperature: 0,
                cityName: '',
                weatherCode: 0,
                state: 'ERROR'
            });
            setForecastWeek({
                days: [],
                state: 'ERROR'
            });
        }
    }

    const isLoaded = forecastToday.state === 'LOADED' && forecastWeek.state === 'LOADED';
    const hasError = forecastToday.state === 'ERROR' || forecastWeek.state === 'ERROR';

    return (
        <>
            <div className={'card'}>
                <form className={'card__header'} onSubmit={searchForForecastByCityName}>
                    <label>
                        <input type={'text'} name={'cityName'} placeholder={'Enter a city...'}/>
                        <img src={SearchIcon} alt={'Search icon'}/>
                    </label>
                    <button>Search</button>
                </form>

                {hasError && (<div>Something went wrong. Please try again...</div>)}

                {isLoaded && (<>
                    <ForecastToday
                        day={forecastToday.day}
                        time={forecastToday.time}
                        temperature={forecastToday.temperature}
                        cityName={forecastToday.cityName}
                        weatherCode={forecastToday.weatherCode}
                        state={forecastToday.state}
                    />

                    <div className={'line'}></div>

                    <div className={'forecast__week__table'}>
                        {
                            forecastWeek.days.map((item) => (
                                <ForecastWeekItem key={item.day} day={item.day} temperature={item.temperature}
                                                  weatherCode={item.weatherCode}/>
                            ))
                        }
                    </div>
                </>)}

            </div>
        </>
    );
}

export default App;
