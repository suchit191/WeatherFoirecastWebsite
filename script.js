// Declare necessary variables
var city = "";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var getAllWeatherDataButton = $("#all-weather-data"); // Renamed to avoid variable conflict
var sCity = [];

// Set up the API key
var APIKey = "a0aca8a89948154a4182dcecc780b513";

// Click Handlers
searchButton.on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadLastCity);
clearButton.on("click", clearHistory);
getAllWeatherDataButton.on("click", getAllWeatherData);

// Function to display the current weather
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

// Function to fetch current weather data
function currentWeather(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        // Parse and display the current weather
        console.log(response);
        var weatherIcon = response.weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
        var date = new Date(response.dt * 1000).toLocaleDateString();
        $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconUrl + ">");
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
        $(currentHumidity).html(response.main.humidity + "%");
        var ws = response.wind.speed;
        var windSpeedMph = (ws * 2.237).toFixed(1);
        $(currentWSpeed).html(windSpeedMph + "MPH");
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getItem("cityname")) || [];
            console.log(sCity);
            if (sCity.length === 0 || find(city) > 0) {
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            }
        }
    });
}

// Function to get UV index
function UVIndex(ln, lt) {
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}

// Function to display the 5-day forecast
function forecast(cityid) {
    var queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url: queryForecastURL,
        method: "GET"
    }).then(function (response) {
        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconCode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconUrl = "https://openweathermap.org/img/wn/" + iconCode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconUrl + ">");
            $("#fTemp" + i).html(tempF + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }
    });
}

// Function to add the passed city to the search history
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}

// Function to display past search when a list group item is clicked
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}

// Function to load the last city from local storage
function loadLastCity() {
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname")) || [];
    for (var i = 0; i < sCity.length; i++) {
        addToList(sCity[i]);
    }
    if (sCity.length > 0) {
        city = sCity[sCity.length - 1];
        currentWeather(city);
    }
}

// Function to clear search history
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();
}

// Example function to get all weather data from the backend
function getAllWeatherData() {
    $.ajax({
        url: "/api/weather",
        method: "GET",
        success: function (data) {
            console.log("Weather data retrieved successfully:", data);
            // Use the data to update the frontend UI as needed
        },
        error: function (error) {
            console.error("Error retrieving weather data:", error);
        }
    });
}

// Function to save weather data to the database
function saveWeatherData(city, date, temperature, humidity, windSpeed, uvIndex) {
    $.ajax({
        url: "/api/weather",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            city,
            date,
            temperature,
            humidity,
            windSpeed,
            uvIndex
        }),
        success: function (response) {
            console.log(response);
        },
        error: function (error) {
            console.error(error);
        }
    });
}
