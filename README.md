# Swiss Electric Charging Stations

A simple solution and displaying electric vehicle charging station locations across Switzerland.

## Architecture

The solution consists of three main projects:

### ChargingStationsMap.Backend
A **ASP.NET Core Web API** (.NET 10.0) that provides REST endpoints for accessing charging station data.

**Key Features:**
- RESTful API for charging station data
- Azure Cosmos DB integration for scalable data storage
- Postal code-based station filtering
- Swagger/OpenAPI documentation

**Technology Stack:**
- .NET 10.0
- ASP.NET Core Web API
- Azure Cosmos DB SDK
- Swagger/OpenAPI

### charging-stations-frontend
A **React application** built with Vite for discovering and interacting with electric vehicle charging stations.

**Key Features:**
- Interactive map view of charging stations using Mapbox GL JS
- Station search by postal code and filtering capabilities
- Responsive design for mobile and desktop

**Technology Stack:**
- React 18 with TypeScript
- Vite (build tool and dev server)
- Tailwind CSS v4
- Mapbox GL JS for interactive maps

### ChargingStationsMap.Seeder
A console application for populating the Cosmos DB database with Swiss charging station data.

**Key Features:**
- Database and container initialization
- JSON data file processing
- Batch data insertion

**Technology Stack:**
- .NET 10.0 Console Application
- Azure Cosmos DB SDK