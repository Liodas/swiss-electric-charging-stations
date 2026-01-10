# Swiss Electric Charging Stations - Frontend

A modern React frontend application built with Vite for discovering electric vehicle charging stations across Switzerland.

## Features

- Interactive Mapbox map view of charging stations
- Postcode search functionality
- Responsive design for mobile and desktop

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS v4
- **Maps**: Mapbox GL JS

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Mapbox**:
   - Create a free account at [Mapbox](https://www.mapbox.com/)
   - Go to your [Account Dashboard](https://account.mapbox.com/access-tokens/)
   - Create a new access token
   - Update `VITE_MAPBOX_ACCESS_TOKEN` in `.env.local` with your token

4. **Configure API endpoint**:

   Update the `VITE_API_URL` in `.env.local` to match your backend API URL.

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:

   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (TypeScript compilation + Vite build)

## Environment Variables

- `VITE_API_URL`: URL of the backend API (default: http://localhost:5068)
- `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token for map functionality

## Related Projects

- [Backend API](../ChargingStationsMap.Backend/) - ASP.NET Core Web API
- [Data Seeder](../ChargingStationsMap.Seeder/) - Data seeding utility