import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {v4 as uuidv4} from 'uuid';

// TODO: Define a City class with name and id properties

class City {
  constructor(public name: string, public id: string) {}
}

// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  private filePath: string;
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.filePath = path.join(__dirname, '../service/searchHistory.json');
  }

  generateId() {
    return uuidv4();
  }

  private async read(): Promise<City[]> {
    try {
        // Check if the file exists
        await fs.access(this.filePath);
        const data = await fs.readFile(this.filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If the file does not exist, create it with an empty array
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            await this.write([]); // Create the file with an empty array
            return []; // Return an empty array
        } else {
            console.error('Error reading search history:', error);
            return [];
        }
    }
}
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    try {
        await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
        console.error('Error writing search history:', error);
    }
}
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]>{
    try {
        const citiesData = await this.read(); // Read the data from the JSON file
        // Ensure that citiesData is an array before mapping
        if (Array.isArray(citiesData)) {
            return citiesData.map((city) => new City(city.name, city.id)); // Map to City objects
        } else {
            console.error('Expected citiesData to be an array, but got:', citiesData);
            return []; // Return an empty array if the data is not in the expected format
        }
    } catch (error) {
        console.error('Error getting cities:', error);
        return []; // Return an empty array in case of an error
    }
}
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    const cities = await this.getCities();
    const cityExists = cities.some(existingCity => existingCity.name.toLowerCase() === city.toLowerCase());

    if (!cityExists) {
        const newCity = new City(city, this.generateId());
        cities.push(newCity);
        await this.write(cities);
    }
}

// * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
async removeCity(id: string) {
    try {
        // Ensure 'this' refers to the current instance of HistoryService
        let cities = await this.getCities(); // Retrieve the current list of cities

        // Check if cities is an array
        if (!Array.isArray(cities)) {
            throw new Error('Expected cities to be an array');
        }

        // Filter out the city with the specified ID
        cities = cities.filter(city => city.id !== id);

        // Write the updated list back to the file
        await this.write(cities);
    } catch (error) {
        console.error('Error removing city:', error);
    }
  }
}
export default new HistoryService();
