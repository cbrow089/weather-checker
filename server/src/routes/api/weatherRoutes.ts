import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { cityName } = req.body;

  try {
      await HistoryService.addCity(cityName); // Add city to history
      const weatherData = await WeatherService.getWeatherForCity(cityName); // Get weather data
      res.status(200).json(weatherData);
  } catch (error) {
      console.error('Error retrieving weather data:', error);
      res.status(500).json({ message: 'Failed to retrieve weather data' });
  }
});

// GET search history
router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.status(200).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve search history' });
  }
});

// BONUS: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params; // Extracting id from request parameters

  try {
      await HistoryService.removeCity(id); // Call the removeCity method
      res.status(204).send(); // Send a 204 No Content response
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete city from search history' });
  }
});

export default router;