// Supabase Init
const supabaseUrl = 'https://qwfgvcrylolaxwfzhsra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Zmd2Y3J5bG9sYXh3Znpoc3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTQyNjksImV4cCI6MjA4OTMzMDI2OX0.-4ER4xXkUmO2S6cdvS25nSC28Chwtrf7VtswmmeqIIA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const errorMsg = document.getElementById('error-message');
const weatherSection = document.getElementById('weather-details');
const navbar = document.getElementById('navbar');
const backToTopBtn = document.getElementById('back-to-top');

const API_KEY = 'f0f9e46ef5fe4bd1af6170319261403';

// Unit Toggle State
let isCelsius = true;
let currentWeatherData = null;
let currentDailyData = null;
let currentLocalTime = null;

// WeatherAPI Condition to FontAwesome Mapping
function getWeatherIcon(code, isDay) {
    // WeatherAPI condition codes
    const codes = {
        1000: isDay ? 'fa-sun' : 'fa-moon', // Sunny / Clear
        1003: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon', // Partly cloudy
        1006: 'fa-cloud', // Cloudy
        1009: 'fa-cloud', // Overcast
        1030: 'fa-smog', // Mist
        1063: 'fa-cloud-rain', // Patchy rain possible
        1066: 'fa-snowflake', // Patchy snow possible
        1069: 'fa-cloud-meatball', // Patchy sleet possible (using meatball as sleet/hail)
        1072: 'fa-cloud-rain', // Patchy freezing drizzle possible
        1087: 'fa-cloud-bolt', // Thundery outbreaks possible
        1114: 'fa-snowflake', // Blowing snow
        1117: 'fa-snowflake', // Blizzard
        1135: 'fa-smog', // Fog
        1148: 'fa-smog', // Freezing fog
        1150: 'fa-cloud-rain', // Patchy light drizzle
        1153: 'fa-cloud-rain', // Light drizzle
        1168: 'fa-cloud-rain', // Freezing drizzle
        1171: 'fa-cloud-rain', // Heavy freezing drizzle
        1180: 'fa-cloud-rain', // Patchy light rain
        1183: 'fa-cloud-rain', // Light rain
        1186: 'fa-cloud-showers-heavy', // Moderate rain at times
        1189: 'fa-cloud-showers-heavy', // Moderate rain
        1192: 'fa-cloud-showers-heavy', // Heavy rain at times
        1195: 'fa-cloud-showers-heavy', // Heavy rain
        1198: 'fa-cloud-rain', // Light freezing rain
        1201: 'fa-cloud-showers-heavy', // Moderate or heavy freezing rain
        1204: 'fa-cloud-meatball', // Light sleet
        1207: 'fa-cloud-meatball', // Moderate or heavy sleet
        1210: 'fa-snowflake', // Patchy light snow
        1213: 'fa-snowflake', // Light snow
        1216: 'fa-snowflake', // Patchy moderate snow
        1219: 'fa-snowflake', // Moderate snow
        1222: 'fa-snowflake', // Patchy heavy snow
        1225: 'fa-snowflake', // Heavy snow
        1237: 'fa-icicles', // Ice pellets
        1240: 'fa-cloud-sun-rain', // Light rain shower
        1243: 'fa-cloud-showers-heavy', // Moderate or heavy rain shower
        1246: 'fa-cloud-showers-heavy', // Torrential rain shower
        1249: 'fa-cloud-meatball', // Light sleet showers
        1252: 'fa-cloud-meatball', // Moderate or heavy sleet showers
        1255: 'fa-snowflake', // Light snow showers
        1258: 'fa-snowflake', // Moderate or heavy snow showers
        1261: 'fa-icicles', // Light showers of ice pellets
        1264: 'fa-icicles', // Moderate or heavy showers of ice pellets
        1273: 'fa-cloud-bolt', // Patchy light rain with thunder
        1276: 'fa-cloud-bolt', // Moderate or heavy rain with thunder
        1279: 'fa-cloud-bolt', // Patchy light snow with thunder
        1282: 'fa-cloud-bolt'  // Moderate or heavy snow with thunder
    };
    return codes[code] || 'fa-cloud';
}

// Format Date
function getShortDay(dateString) {
    const options = { weekday: 'short' };
    
    // Create date from "YYYY-MM-DD" string by appending time so it parses as local timezone rather than UTC
    const dateArgs = dateString.split('-');
    if(dateArgs.length === 3) {
       const date = new Date(dateArgs[0], dateArgs[1] - 1, dateArgs[2]);
       return date.toLocaleDateString(undefined, options);
    }
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Fetch Weather Data
async function getWeatherData(city) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return {
            name: `${data.location.name}, ${data.location.country}`,
            current: data.current,
            forecast: data.forecast.forecastday,
            localtime: data.location.localtime
        };

    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// Update UI
function updateUI(data) {
    // Current Weather
    document.getElementById('city-name').textContent = data.name;
    
    // we use location.localtime for formatting to avoid time zone drift
    const localDate = new Date(data.localtime.replace(/-/g, '/')); 
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = localDate.toLocaleDateString(undefined, options);
    
    currentWeatherData = data.current;
    currentDailyData = data.forecast;
    currentLocalTime = data.localtime;
    
    renderTemperatures();

    document.getElementById('weather-desc').textContent = data.current.condition.text;
    
    const iconClass = getWeatherIcon(data.current.condition.code, data.current.is_day);
    const iconEl = document.getElementById('current-icon');
    iconEl.className = `fa-solid ${iconClass}`;
    
    document.getElementById('humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('wind-speed').textContent = `${data.current.wind_kph} km/h`;
    document.getElementById('pressure').textContent = `${data.current.pressure_mb} hPa`;

    // Weekly Forecast
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    for (let i = 0; i < data.forecast.length; i++) {
        const dayData = data.forecast[i];
        
        const isToday = i === 0;
        const dayName = isToday ? 'Today' : getShortDay(dayData.date);
        const dailyIcon = getWeatherIcon(dayData.day.condition.code, 1);

        const tMinC = dayData.day.mintemp_c;
        const tMaxC = dayData.day.maxtemp_c;
        const tMinF = dayData.day.mintemp_f;
        const tMaxF = dayData.day.maxtemp_f;

        const tMin = isCelsius ? Math.round(tMinC) : Math.round(tMinF);
        const tMax = isCelsius ? Math.round(tMaxC) : Math.round(tMaxF);

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon"><i class="fa-solid ${dailyIcon}"></i></div>
            <div class="forecast-temps">${tMax}° <span>${tMin}°</span></div>
        `;
        forecastContainer.appendChild(item);
    }

    // Change Theme based on time of day (Bonus!)
    if (data.current.is_day === 1) {
        document.body.setAttribute('data-theme', 'day');
    } else {
        document.body.setAttribute('data-theme', 'night');
    }

    // Show section and scroll nicely only if dashboard is visible
    weatherSection.classList.remove('hidden');
    if (!dashboardView.classList.contains('hidden')) {
        weatherSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderTemperatures() {
    if(!currentWeatherData) return;
    
    let temp = isCelsius ? currentWeatherData.temp_c : currentWeatherData.temp_f;
    document.getElementById('current-temp').textContent = `${Math.round(temp)}°${isCelsius ? 'C' : 'F'}`;
    
    if (currentDailyData && currentDailyData.length > 0) {
        const today = currentDailyData[0].day;
        const tMax = isCelsius ? Math.round(today.maxtemp_c) : Math.round(today.maxtemp_f);
        const tMin = isCelsius ? Math.round(today.mintemp_c) : Math.round(today.mintemp_f);
        document.getElementById('hi-temp').textContent = `H: ${tMax}°`;
        document.getElementById('lo-temp').textContent = `L: ${tMin}°`;

        // Hourly Forecast
        const hourlyContainer = document.getElementById('hourly-container');
        if (hourlyContainer) {
            hourlyContainer.innerHTML = '';
            
            let currentHour = 0;
            if (currentLocalTime) {
                const timeParts = currentLocalTime.split(' ');
                if (timeParts.length > 1) {
                    currentHour = parseInt(timeParts[1].split(':')[0], 10);
                }
            }
            
            // Combine next 24 hours from today and tomorrow
            const combinedHours = [];
            currentDailyData.forEach(day => {
                if (day && day.hour) {
                    combinedHours.push(...day.hour);
                }
            });
            
            const next24 = combinedHours.slice(currentHour, currentHour + 24);
            
            next24.forEach((hourObj, index) => {
                const timeStr = hourObj.time.split(' ')[1]; // "HH:MM"
                const hourTemp = isCelsius ? Math.round(hourObj.temp_c) : Math.round(hourObj.temp_f);
                
                // For the very first item (current hour), we can label it "Now"
                const displayTime = index === 0 ? 'Now' : timeStr;
                
                // Get FontAwesome icon class
                const isDay = hourObj.is_day; // weatherapi provides `is_day` in hourly data
                const hourIcon = getWeatherIcon(hourObj.condition.code, isDay);
                
                const item = document.createElement('div');
                item.className = 'hourly-item';
                item.innerHTML = `
                    <div class="hourly-time">${displayTime}</div>
                    <div class="hourly-icon"><i class="fa-solid ${hourIcon}"></i></div>
                    <div class="hourly-temp">${hourTemp}°</div>
                `;
                hourlyContainer.appendChild(item);
            });
        }
    }

    // Re-render weekly if it exists
    if(currentDailyData) {
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = '';
        for (let i = 0; i < currentDailyData.length; i++) {
            const dayData = currentDailyData[i];
            
            const isToday = i === 0;
            const dayName = isToday ? 'Today' : getShortDay(dayData.date);
            const dailyIcon = getWeatherIcon(dayData.day.condition.code, 1);

            const tMinC = dayData.day.mintemp_c;
            const tMaxC = dayData.day.maxtemp_c;
            const tMinF = dayData.day.mintemp_f;
            const tMaxF = dayData.day.maxtemp_f;

            const tMin = isCelsius ? Math.round(tMinC) : Math.round(tMinF);
            const tMax = isCelsius ? Math.round(tMaxC) : Math.round(tMaxF);

            const item = document.createElement('div');
            item.className = 'forecast-item';
            item.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon"><i class="fa-solid ${dailyIcon}"></i></div>
                <div class="forecast-temps">${tMax}° <span>${tMin}°</span></div>
            `;
            forecastContainer.appendChild(item);
        }
    }
}

// Supabase Authentication & Logging
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const landingView = document.getElementById('landing-view');
const dashboardView = document.getElementById('dashboard-view');

googleLoginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const ogHtml = googleLoginBtn.innerHTML;
    googleLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';
    googleLoginBtn.disabled = true;

    const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        console.error("Login Error:", error.message);
        googleLoginBtn.innerHTML = ogHtml;
        googleLoginBtn.disabled = false;
        alert("Failed to login: " + error.message);
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        // Log in event
        landingView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        
        if (event === 'SIGNED_IN') {
             logUserLogin(session.user);
        }
    } else {
        // Logged out
        landingView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
});

async function logUserLogin(user) {
    try {
        // Get IP Addr
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        
        // Log to Supabase
        await supabase.from('user_logs').insert([
            {
                user_id: user.id,
                email: user.email,
                ip_address: ipData.ip
            }
        ]);
    } catch (e) {
        console.error("Failed to log user login", e);
    }
}

// Event Listeners
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (!city) return;

    errorMsg.classList.add('hidden');
    
    const btn = document.getElementById('search-btn');
    const ogText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const data = await getWeatherData(city);
        updateUI(data);
    } catch (error) {
        errorMsg.classList.remove('hidden');
        weatherSection.classList.add('hidden');
    } finally {
        btn.innerHTML = ogText;
    }
});

// Unit Toggle
const unitToggleBtn = document.getElementById('unit-toggle');
unitToggleBtn.addEventListener('click', () => {
    isCelsius = !isCelsius;
    unitToggleBtn.textContent = isCelsius ? '°C' : '°F';
    unitToggleBtn.title = isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius';
    renderTemperatures();
});

// Navbar scroll styles & Back to top visibility
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'var(--clr-nav-bg)';
        navbar.style.boxShadow = '0 2px 10px var(--clr-shadow)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    }

    if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

// Back to top click
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Smooth scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if(mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
        }

        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Initialize with user's approximate location
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const weatherData = await getWeatherData('auto:ip');
        updateUI(weatherData);

        // If not logged in, but we fetched the weather data successfully,
        // it won't scroll due to our updateUI check.
    } catch (error) {
        console.log("Could not fetch location based weather automatically.", error);
    }
});

// Custom Subtle Mouse Glow Effect removed for cleaner Apple aesthetic
