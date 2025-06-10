/*  api key for openweathermap api - required to make requests to their service
    you can get ur own key by signing up at https://openweathermap.org
    i created this for events user story
*/
const OPENWEATHER_API_KEY = '3185ab2a91dc6f965be3d14d69a0fbe0';
/*
    main function to fetch weather data based on latitude, longitude & date
    returns an object with weather condition and temperature
*/
export const getWeather = async (lat, lon, date) => {
  try {
    // convert date to unix time (seconds since epoch & required by api) -> makes it easier to compare with api timestamps
    const targetTime = Math.floor(date.getTime() / 1000);
    const currentTime = Math.floor(Date.now() / 1000);
    // determine if the requested date is in the future
    const isFuture = targetTime > currentTime;

    // initialize variable for the api url
    let url;
    
    // check if the date is within next 5 days (5 days * 24 hours * 3600 seconds)
    if (isFuture && (targetTime - currentTime) <= 5 * 24 * 3600) {
      // if future dates within 5 days, use forecast api which provides 3-hour intervals
      // for up to 5 days (more detailed predictions)
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else {
      // for current weather or dates beyond 5 days, use current weather api
      // (note: beyond 5 days would actually require a different api)
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    }

    // make the api request and wait for response
    const response = await fetch(url);
    
    // parse the response as json
    const data = await response.json();

    // if we're looking at future weather & got forecast data (which has list property)
    if (isFuture && data.list) {
      // find the forecast thats closest to our target time
      // reduce compares all forecasts & keeps the one with smallest time difference
      const forecast = data.list.reduce((prev, curr) => 
        Math.abs(curr.dt - targetTime) < Math.abs(prev.dt - targetTime) ? curr : prev
      );
      
      // return the relevant weather data from the closest forecast
      return {
        condition: forecast.weather[0].main,  
        temperature: forecast.main.temp,     
      };
    }
    
    // for current weather or when no forecast data available, return the weather data from the immediate response
    return {
      condition: data.weather[0].main,     
      temperature: data.main.temp,          
    };
  } catch (error) {
    // if anything goes wrong with the api request, log the error
    console.error("Weather API error:", error);
    
    // return mock data as a fallback to ensure the app keeps working
    return {
      condition: "Clear",  
      temperature: 22,     
    };
  }
};