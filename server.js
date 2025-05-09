const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());


const DB = 'mongodb+srv://vijaypalsaniyajaipur:vijay@cluster0.arf1mtq.mongodb.net/weatherdb?retryWrites=true&w=majority';

mongoose.connect(DB).then(() => {
    console.log('Connection successful');
}).catch((err) => console.log('No connection'));

const PORT = process.env.PORT || 3000;

const weatherSchema = new mongoose.Schema({
    city: String,
    date: String,
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    uvIndex: Number
});

const Weather = mongoose.model('Weather', weatherSchema);

app.use(bodyParser.json());

app.post('/api/weather', (req, res) => {
    const { city, date, temperature, humidity, windSpeed, uvIndex } = req.body;

    const newWeather = new Weather({
        city,
        date,
        temperature,
        humidity,
        windSpeed,
        uvIndex
    });

    newWeather.save((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send('Weather data saved successfully');
        }
    });
});

// Example route to retrieve all weather data from the database
app.get('/api/weather', (req, res) => {
    Weather.find({}, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).json(data);
        }
    });
});

// Add a simple route handler for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the Weather API'); // You can customize this message
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
