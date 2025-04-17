# Aurora Explorer

## Platform where you can see, share and get information about aurora borealis

Aurora Explorer is a web application designed for everyone who loves seeing the northern sky shows. It offers all real-time data needed for watching aurora and serves as a social network where users can share their aurora sightings. By putting together weather updates, KP forecasts and content made by users, Aurora Explorer creates a one of a kind website for watching and enjoying auroras.

## Key Features

### Forecasts
 - Real-time aurora borealis forecast data
 - KP index prediction in 3 hour intervals
 - Cloud coverage predictiono in 3 hour intervals

### Interactive Map
 - Live map of recent aurora sightings
 - User-submitted photo locations

### Community Features
 - User photo sharing
 - Comment and like option
 - Personal aurora sighting history
 - Email notifications for posts in user-selected area

 ## Requirements
 - Node.js
 - MongoDB database
 - Google Maps API link with key
 - OpenWeatherMap API key
 - Email credentials for notifications

## Official Website

https://aurora.roky.fun

## Instalation

1. Clone the repository

```bash
git clone https://github.com/gyarab/2024-4E-Mitosinka-AuroraExplorer
```

2. Navigate to project directory

```bash
cd 2024-4E-Mitosinka-AuroraExplorer
```

3. Install dependencies
```bash
npm install
```

4. Create .env file in root directory
```bash
ACCESS_TOKEN_SECRET=access_token
MONGODB_URI=mongodb_connection_string
GOOGLE_API_KEY=google_maps_link_with_api_key
OPENWEATHER_API_KEY=open_weather_api_key
EMAIL_USER=email
EMAIL_APP_PASSWORD=16_letter_generated_email_password
WEBSITE_URL=website_url
```

5. Start server
```bash
node server.js
```
6. Connect to server at https://localhost:3000

## Note

### Some features might be disabled without configuration of .env:
 - Database connection
 - Google Maps link with API key
 - Email configuration
 - OpenWeatherMap API key

### Where to get keys and configurations
- Google Maps API key: https://developers.google.com/maps/documentation/javascript/get-api-key
- Google Maps API link: 'https://maps.googleapis.com/maps/api/js?key=API_KEY' (paste with key to .env in GOOGLE_API_KEY variable)
- Opeanweahtermap API key: https://openweathermap.org/current
- Email app password: https://support.google.com/mail/answer/185833?hl=en
- MongoDB URI: https://www.mongodb.com/docs/manual/reference/connection-string/





