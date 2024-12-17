import './App.css'
import {fetchWeatherApi} from 'openmeteo';
import {useState} from "react";


type ForecastToday = {
    day: string;
    time: string;
    temperature: number;
    cityName: string;
    weatherCode: number;
    state: 'NOT_LOADED' | 'LOADING' | 'LOADED' | 'ERROR';
}

type ForecastWeek = {
    days: Array<{
        day: string;
        temperature: number;
        weatherCode: number;
    }>,
    state: 'NOT_LOADED' | 'LOADING' | 'LOADED' | 'ERROR';
};

function ForecastToday(props: ForecastToday) {

    if (props.state === 'NOT_LOADED') {
        return (<div></div>);
    }

    if (props.state === 'LOADING') {
        return (<div>Loading...</div>)
    }

    if (props.state === 'ERROR') {
        return (<div>Error</div>)
    }

    return (
        <div className={"forecast__today"}>
            <div className={"forecast__today__image__wrapper"}>
                <div>{props.weatherCode}</div>
            </div>
            <div className={"forecast__today__info__wrapper"}>
                <div className={"forecast__today__info__temperature"}>{props.temperature} °C</div>
                <div className={"forecast__today__info__city"}>{props.cityName}</div>
                <div className={"forecast__today__info__day"}>{props.day} {props.time}</div>
            </div>
        </div>
    );
}


function App() {

    const [forecastToday, setForecastToday] = useState<ForecastToday>({
        day: '',
        time: '',
        temperature: 0,
        cityName: '',
        weatherCode: 0,
        state: 'NOT_LOADED'
    });

    const [forecastWeek, setForecastWeek] = useState<ForecastWeek>({
        days: [],
        state: 'NOT_LOADED'
    })


    const searchForForecastByCityName = async (e) => {

        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const cityName = formData.get('cityName')! as string;

        const params = {
            name: cityName
        }

        const response1 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${params.name}&count=1&language=en&format=json`)
        const data = await response1.json();

        console.log(data);
        const result = data.results[0];
        const lat = result.latitude;
        const lon = result.longitude;

        console.log(lat, lon);

        const params2 = {
            latitude: [lat],
            longitude: [lon],
            current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min'
        };
        const url = 'https://api.open-meteo.com/v1/forecast';
        const responses = await fetchWeatherApi(url, params2);

// Helper function to form time ranges
        const range = (start: number, stop: number, step: number) =>
            Array.from({length: (stop - start) / step}, (_, i) => start + i * step);

// Process first location. Add a for-loop for multiple locations or weather models
        const response = responses[0];
        window.test_response = response;

// Attributes for timezone and location
        const utcOffsetSeconds = response.utcOffsetSeconds();

        const current = response.current()!;
        const daily = response.daily()!;

// Note: The order of weather variables in the URL query and the indices below need to match!
        const weatherData = {
            current: {
                time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
                temperature: current.variables(0)!.value(), // Current is only 1 value, therefore `.value()`
                weatherCode: current.variables(1)!.value(),
                windSpeed: current.variables(2)!.value(),
                windDirection: current.variables(3)!.value()
            },
            daily: {
                time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
                    (t) => new Date((t + utcOffsetSeconds) * 1000)
                ),
                weatherCode: daily.variables(0)!.valuesArray()!,
                temperatureMax: daily.variables(1)!.valuesArray()!,
                temperatureMin: daily.variables(2)!.valuesArray()!,
            }
        };

// `weatherData` now contains a simple structure with arrays for datetime and weather data
        for (let i = 0; i < weatherData.daily.time.length; i++) {
            console.log(
                weatherData.daily.time[i].toISOString(),
                weatherData.daily.weatherCode[i],
                weatherData.daily.temperatureMax[i],
                weatherData.daily.temperatureMin[i]
            );
        }
        console.log(
            weatherData.current.time.toISOString(),
            weatherData.current.temperature,
            weatherData.current.weatherCode,
            weatherData.current.windSpeed,
            weatherData.current.windDirection
        );

        setForecastToday({
            // get day in format Monday
            day: weatherData.current.time.toLocaleDateString('en-US', {weekday: 'long'}),
            // get time in format HH:MM
            time: weatherData.current.time.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
            temperature: Number(weatherData.current.temperature.toFixed(0)),
            cityName: cityName,
            weatherCode: weatherData.current.weatherCode,
            state: 'LOADED'
        })

        setForecastWeek({
            days: weatherData.daily.time.map((time, index) => {
                return {
                    day: time.toLocaleDateString('en-US', {weekday: 'long'}),
                    // TODO: Which temperature should be displayed here?
                    temperature: Number(
                        (
                            (
                                Number(weatherData.daily.temperatureMax[index].toFixed(0)) +
                                Number(weatherData.daily.temperatureMax[index].toFixed(0))
                            ) / 2
                        ).toFixed(0)
                    ),
                    weatherCode: weatherData.daily.weatherCode[index]
                }
            }),
            state: 'LOADED'
        })

    }

    return (
        <>
            <div className={'card'}>
                <div className={'card__header'}>
                    <form onSubmit={searchForForecastByCityName}>
                        <input type={'text'} name={'cityName'} placeholder={'Enter a city...'}/>
                        <button>Search</button>
                    </form>
                </div>

                <ForecastToday
                    day={forecastToday.day}
                    time={forecastToday.time}
                    temperature={forecastToday.temperature}
                    cityName={forecastToday.cityName}
                    weatherCode={forecastToday.weatherCode}
                    state={forecastToday.state}
                />
                <div className={'forecast__week__table'}>
                    <div className={'line'}></div>
                    {
                        forecastWeek.days.map((day, index) => (
                            <div key={day.day} className={'forecast__week__item'}>
                                <div className={"forecast__week__image__wrapper"}>
                                    <img alt={String(day.weatherCode)}></img>
                                </div>
                                <div className={'forecast__week__item__day'}>{day.day}</div>
                                <div className={'forecast__week__item__temperature'}>{day.temperature}°C</div>
                                <div className={'line'}></div>
                            </div>
                        ))
                    }

                </div>
            </div>
        </>
    );
}

export default App;
