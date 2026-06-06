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

    showMessage("Searching...");

    try {
        const results = await searchCity(input, 100);
        displayCities(results);
    } catch (error) {
        console.error(error);
        showMessage("Failed");
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
