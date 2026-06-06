function displayCities(cities) {
    weatherlist.innerHTML = "";

    if (!cities.length) {
        weatherlist.innerHTML = `<div class="messagerow">${"No results."}</div>`;
        return;
    }

    cities.forEach(city => {
        const row = document.createElement("div");
        const location = getLocationText(city);
        row.className = "singleweather";

        row.innerHTML = `
            <div class="weathersummary">
                <div>
                    <div class="cityname">${city.name}</div>
                    <div class="citylocation">${location}</div>
                </div>
                <div>•</div>
            </div>

            <div class="weather-details">
                <div class="weatheritem">
                    <span class="weatherlabel">Temp</span>
                    <span class="weathervalue">Loading...</span>
                </div>
                <div class="weatheritem">
                    <span class="weatherlabel">Condition</span>
                    <span class="weathervalue">Loading...</span>
                </div>
                <div class="weatheritem">
                    <span class="weatherlabel">Humidity</span>
                    <span class="weathervalue">Loading...</span>
                </div>
                <div class="weatheritem">
                    <span class="weatherlabel">Wind Speed</span>
                    <span class="weathervalue">Loading...</span>
                </div>
            </div>
        `;

        row.querySelector(".weathersummary").addEventListener("click", async () => {
            row.classList.toggle("open");

            if (row.classList.contains("open") && !row.dataset.loaded) {
                await loadWeatherForCity(city, row.querySelector(".weatherdetails"), row);
            }
        });

        weatherlist.appendChild(row);
    });
}

async function searchCity(cityName, count = 100) {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("language", "en");
    url.searchParams.set("countryCode", "CA");
    url.searchParams.set("name", cityName);
    url.searchParams.set("count", String(count));
    url.searchParams.set("format", "json");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Search Failed");
    }

    const data = await response.json();
    const results = data.results || [];

    const finalResults = results.filter(item => item.country_code === "CA");

    if (count === 1) {
        return finalResults[0] || results[0] || null;
    }

    return finalResults;
}

async function searchingCity() {
    const input = searchInput.value.trim();

    if (input === "") {
        displayCities(defaultCanadianCities.map(name => ({ name })));
        return;
    }

    weatherlist.innerHTML = `<div class="messagerow">${"Searching..."}</div>`;

    try {
        const results = await searchCity(input, 100);
        displayCities(results);
    } catch (error) {
        console.error(error);
        weatherlist.innerHTML = `<div class="messagerow">${"Failed."}</div>`;
    }
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
