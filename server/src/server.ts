import dotenv from 'dotenv';
import express from 'express';
import routes from './routes/index.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Optional, if you need to parse URL-encoded data

// Serve static files from the client/dist folder
app.use(express.static('client/dist'));

// Connect the routes
app.use(routes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));