import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

import HistoryService from '../service/historyService.js';

// GET search history
router.get('/history', async (_req, res) => {
  try {
      const history = await HistoryService.getCities(); // Retrieve the search history
      res.status(200).json(history); // Send the history as a JSON response
  } catch (error) {
      console.error('Error retrieving search history:', error);
      res.status(500).json({ message: 'Failed to retrieve search history' });
  }
});
// TODO: Define route to serve index.html
router.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, '../../../client/dist/index.html'); // Adjusted path to index.html
  res.sendFile(indexPath) 
  });


export default router;