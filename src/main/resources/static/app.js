const weatherDescriptions = {
    0: { text: "Sunny" },
    1: { text: "Partly Cloudy"},
    2: { text: "Cloudy"},
    3: { text: "Overcast"},
    45: { text: "Foggy"},
    48: { text: "Icy Fog"},
    51: { text: "Light Drizzle"},
    53: { text: "Moderate Drizzle"},
    55: { text: "Heavy Drizzle"},
    61: { text: "Light Rain"},
    63: { text: "Moderate Rain"},
    65: { text: "Heavy Rain"},
    71: { text: "Light Snow"},
    73: { text: "Moderate Snow"},
    75: { text: "Heavy Snow"},
    80: { text: "Light Showers"},
    81: { text: "Moderate Showers"},
    82: { text: "Heavy Showers"},
    95: { text: "Thunderstorm"},
    96: { text: "Thunderstorm & L Hail"},
    99: { text: "Thunderstorm & H Hail"}
};

const defaultCanadianCities = [
    "Vancouver", "Burnaby", "Richmond", "Surrey", "Coquitlam", "Delta", "Langley", "Abbotsford", "Victoria", "Nanaimo",
];

async function fetchWeather(city) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", city.latitude);
    url.searchParams.set("longitude", city.longitude);
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Weather request failed");
    }

    const data = await response.json();
    return data.current;
}

function updateDetails(details, weather) {
    const description = weatherDescriptions[weather.weather_code] || { text: "Unknown" };
    const values = details.querySelectorAll(".weathervalue");

    values[0].textContent = `${Math.round(weather.temperature_2m)}°C`;
    values[1].textContent = `${description.text}`;
    values[2].textContent = `${weather.relative_humidity_2m}%`;
    values[3].textContent = `${Math.round(weather.wind_speed_10m)} km/h`;
}

function setErrorDetails(details, message) {
    const values = details.querySelectorAll(".weathervalue");
    values.forEach(value => {
        value.textContent = message;
    });
}

function showMessage(message) {
    weatherList.innerHTML = `<div class="messagerow">${replaceHTML(message)}</div>`;
}

function getLocationText(city) {
    const parts = [];

    if (city.admin1 && city.admin1 !== "Canada") {
        parts.push(city.admin1);
    }

    if (city.country && city.country !== city.admin1) {
        parts.push(city.country);
    }

    if (!parts.length) {
        parts.push("Canada");
    }

    return parts.join(", ");
}

function replaceHTML(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

searchButton.addEventListener("click", searchingCity);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchCity();
    }
});


function displayCities(cities) {
    weatherList.innerHTML = "";

    if (!cities.length) {
        showMessage("No results.");
        return;
    }

    cities.forEach(city => {
        const row = document.createElement("div");
        const location = getLocationText(city);
        row.className = "singleweather";

        row.innerHTML = `
            <div class="weather-summary">
                <div>
                    <div class="cityname">${replaceHTML(city.name)}</div>
                    <div class="citylocation">${replaceHTML(location)}</div>
                </div>
                <div>•</div>
            </div>

            <div class="weather-details">
                <div class="weather-item">
                    <span class="weather-label">Temp</span>
                    <span class="weather-value">Loading...</span>
                </div>
                <div class="weather-item">
                    <span class="weather-label">Condition</span>
                    <span class="weather-value">Loading...</span>
                </div>
                <div class="weather-item">
                    <span class="weather-label">Humidity</span>
                    <span class="weather-value">Loading...</span>
                </div>
                <div class="weather-item">
                    <span class="weather-label">Wind Speed</span>
                    <span class="weather-value">Loading...</span>
                </div>
            </div>
        `;

        const summary = row.querySelector(".weather-summary");
        const details = row.querySelector(".weather-details");

        summary.addEventListener("click", async () => {
            row.classList.toggle("open");

            if (row.classList.contains("open") && !row.dataset.loaded) {
                await loadWeatherForCity(city, details, row);
            }
        });

        weatherList.appendChild(row);
    });
}

async function loadWeatherForCity(city, details, row) {
    try {
        let targetCity = city;

        if (typeof targetCity.latitude !== "number" || typeof targetCity.longitude !== "number") {
            targetCity = await searchCity(city.name, 1);

            if (!targetCity) {
                setErrorDetails(details, "N/A");
                return;
            }
        }

        const weather = await fetchWeather(targetCity);
        updateDetails(details, weather);
        row.dataset.loaded = "true";
    } catch (error) {
        console.error(error);
        setErrorDetails(details, "Failed");
    }
}

displayCities(defaultCanadianCities.map(name => ({ name })));
