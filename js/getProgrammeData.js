const STORAGE_KEY = "programmeData"; // Key for localStorage
const LAST_UPDATE_KEY = "programmeLastUpdate"; // Key to track last update
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour (adjust as needed)

export async function getProgrammeData(forceUpdate = false) {
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
    const now = Date.now();

    // Check if cached data exists and is still valid
    if (!forceUpdate && lastUpdate && now - lastUpdate < CACHE_DURATION) {
        const cachedData = localStorage.getItem(STORAGE_KEY);
        if (cachedData) {
            console.log("Using cached programme data");
            return JSON.parse(cachedData);
        }
    }

    try {
        console.log("Fetching new programme data...");
        const response = await fetch('https://script.google.com/macros/s/AKfycbxQMY0Yb7VfC9I4ddAb6S1KA6WQ2xTc9xcSVlA0SwXUeOhkkpuO1RyNcVsk_ivoSNFI2w/exec');
        if (!response.ok) {
            throw new Error('Failed to load programme data.');
        }

        const data = await response.json();
        if (!data.programme || !Array.isArray(data.programme)) {
            throw new Error('Invalid API response format.');
        }

        // Save data to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.programme));
        localStorage.setItem(LAST_UPDATE_KEY, now.toString());

        return data.programme;
    } catch (error) {
        console.error('Error loading programme data:', error);

        // If fetching fails, try to load from cache
        const cachedData = localStorage.getItem(STORAGE_KEY);
        if (cachedData) {
            console.warn("Using cached programme data due to fetch error");
            return JSON.parse(cachedData);
        }

        return null;
    }
}
