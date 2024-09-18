import dotenv from 'dotenv';
import axios from 'axios'; 

dotenv.config(); // Load environment variables

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

interface WeatherData {
  coord: {
      lon: number;
      lat: number;
  };
  weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
  }>;
  main: {
      temp: number; // Temperature in Kelvin
      humidity: number;
  };
  dt: number; // Unix timestamp
  name: string; // City name
  wind: {
      speed: number; // Wind speed
  };
}

interface IWeather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

interface Forecast {
  date: string;
  tempF: number;
  description: string;
  icon: string;
}
// Complete the WeatherService class
class WeatherService {
  // Define the baseURL and API key properties
  private baseURL: string = 'https://api.openweathermap.org/data/2.5/weather'; // Update base URL for weather
  private baseForecastURL: string = 'https://api.openweathermap.org/data/2.5/forecast'; // Base URL for forecast
  private apiKey = process.env.API_KEY;

  // Create fetchLocationData method to fetch coordinates based on city name
  private async fetchLocationData(query: string): Promise<Coordinates> {
    try {
      const response = await axios.get(this.buildGeocodeQuery(query));
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', response.data);
      return this.destructureLocationData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching location data:', error.response ? error.response.data : error.message);
        console.error('Status Code:', error.response ? error.response.status : 'N/A');
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  // Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || !locationData.coord) {
      throw new Error('Invalid location data received from API');
    }
    return {
      lat: locationData.coord.lat,
      lon: locationData.coord.lon,
    };
  }

  // Create buildGeocodeQuery method
  private buildGeocodeQuery(query: string): string {
    const url = `${this.baseURL}?q=${query}&appid=${this.apiKey}`;
    console.log('Geocode Query URL:', url); // Log the URL
    return url;
  }

  // Create fetchWeatherData method
  public async fetchWeatherData(coordinates: Coordinates): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseURL}?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`);
     
      // Return the current weather data
      return response.data;

    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error; // Rethrow the error to handle it in the calling function
    }
  }
  // Create fetchForecastData method
  private async fetchForecastData(coordinates: Coordinates): Promise<any> {
    try {
      const response = await axios.get(`${this.baseForecastURL}?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`);
      return response.data; // Return the forecast data
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      throw error; // Rethrow the error to handle it in the calling function
    }
  }
  // Build parseCurrentWeather method
 async parseCurrentWeather(weatherData: WeatherData): Promise<IWeather> {
    return {
      city: weatherData.name,
      date: new Date(weatherData.dt * 1000).toLocaleDateString(), // Format the date
      icon: weatherData.weather[0].icon, // Weather icon
      iconDescription: weatherData.weather[0].description, // Weather description
      tempF: Math.round((weatherData.main.temp - 273.15) * 9/5 + 32), // Convert Kelvin to Fahrenheit
      windSpeed: weatherData.wind.speed, // Wind speed
      humidity: weatherData.main.humidity // Humidity
    };
}

// Build parseForecastWeather method
private parseForecastWeather(forecastData: any): Forecast[] {
  // Log the forecast data to inspect its structure
  console.log('Forecast Data:', forecastData);

  // Get today's date
  const currentWeatherDate = new Date(forecastData.list[0].dt * 1000); // Assuming the first item is the current weather
  
  // Create an array to hold the next 5 days starting from tomorrow
  const nextFiveDays: string[] = [];
  for (let i = 1; i <= 5; i++) { // Start from 1 to get tomorrow's date
    const nextDate = new Date(currentWeatherDate);
    nextDate.setDate(currentWeatherDate.getDate() + i);
    nextFiveDays.push(nextDate.toISOString().split('T')[0]); // Store dates in YYYY-MM-DD format
  }

  // Create a map to hold daily forecasts
  const dailyForecastMap: { [key: string]: any } = {};

  // Filter and aggregate the forecast data
  forecastData.list.forEach((item: any) => {
      console.log('Forecast Item:', item); // Log each forecast item

      const forecastDate = new Date(item.dt * 1000);
      const dateKey = forecastDate.toISOString().split('T')[0]; // Use YYYY-MM-DD as the key

      // Only consider forecasts within the next 5 days
      if (nextFiveDays.includes(dateKey)) {
          // If the date is not in the map, initialize it
          if (!dailyForecastMap[dateKey]) {
            dailyForecastMap[dateKey] = {
                date: forecastDate.toLocaleDateString(), // Use toLocaleDateString to remove time
                tempF: 0, // Initialize temperature in Fahrenheit
                count: 0, // Count of entries for averaging
                humidity: 0, // Initialize humidity
                windSpeed: 0, // Initialize wind speed
                description: item.weather[0]?.description || '', // Use the first description
                icon: item.weather[0]?.icon || '' // Use the first icon
            };
          }

          // Ensure the main object exists before processing
          if (item.main) {
              const tempInFahrenheit = (item.main.temp - 273.15) * 9/5 + 32; // Convert Kelvin to Fahrenheit
              if (!isNaN(tempInFahrenheit)) {
                  dailyForecastMap[dateKey].tempF += tempInFahrenheit; // Aggregate temperature
                  dailyForecastMap[dateKey].count += 1; // Increment count
                  console.log(`Aggregated Temperature for ${dateKey}:`, dailyForecastMap[dateKey].tempF); // Log aggregated temperature
              } else {
                  console.warn('Temperature is not a number for item:', item); // Log a warning if temperature is NaN
              }

              // Aggregate humidity and wind speed
              dailyForecastMap[dateKey].humidity += item.main.humidity || 0; // Aggregate humidity
              dailyForecastMap[dateKey].windSpeed += item.wind?.speed || 0; // Aggregate wind speed
          } else {
              console.warn('Main object is undefined for item:', item); // Log a warning if main is undefined
          }
      }
  });

  // Convert the map to an array and calculate the average values
  const result: Forecast[] = Object.values(dailyForecastMap).map((dailyForecast: any) => ({
      date: dailyForecast.date,
      tempF: dailyForecast.count > 0 ? Math.round(dailyForecast.tempF / dailyForecast.count) : 0, // Average temperature in Fahrenheit
      humidity: dailyForecast.count > 0 ? Math.round(dailyForecast.humidity / dailyForecast.count) : 0, // Average humidity
      windSpeed: dailyForecast.count > 0 ? Math.round(dailyForecast.windSpeed / dailyForecast.count) : 0, // Average wind speed
      description: dailyForecast.description, // Use the first description
      icon: dailyForecast.icon // Use the first icon
  })).slice(0, 5); // Return only the next 5 days

  console.log('Final Forecast Result:', result); // Log the final result
  return result; // Return the final result
}
  // Complete buildForecastArray method
  async buildForecastArray(city: string): Promise<Forecast[]> {
    console.log('getForecast called with city:', city); // Log to confirm method is called
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}`);
        const forecastData = response.data;

        console.log('Forecast Data from API:', forecastData);

        // Process the forecast data directly here
        if (!forecastData.list || !Array.isArray(forecastData.list)) {
            console.error('Invalid forecast data:', forecastData);
            return []; // Return an empty array or handle the error as needed
        }

        // Build and return the forecast array
        return forecastData.list.map((data: any) => ({
            date: new Date(data.dt * 1000).toLocaleString(), // Convert Unix timestamp to readable date
            temperature: (data.main.temp - 273.15) * 9/5 + 32, // Convert Kelvin to Fahrenheit
            description: data.weather[0].description, // Weather description from the first element of the weather array
            icon: data.weather[0].icon, // Icon from the first element of the weather array
        }));
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        return []; // Return an empty array or handle the error as needed
    }
}

  // Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    const coordinates = await this.fetchLocationData(city); // Fetch coordinates based on city name
    const weatherData: WeatherData = await this.fetchWeatherData(coordinates); // Fetch current weather data
    const forecastData = await this.fetchForecastData(coordinates); // Fetch forecast data

    return {
      current: await this.parseCurrentWeather(weatherData), // Parse and return current weather
      forecast: this.parseForecastWeather(forecastData) // Parse and return forecast data
    };
  }
}

export default new WeatherService();