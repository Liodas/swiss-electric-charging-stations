# Swiss Electric Charging Stations

_A comprehensive solution for managing and displaying electric vehicle charging station locations across Switzerland. This project provides a REST API for accessing charging station data stored in Azure Cosmos DB._

## Architecture

The solution consists of two main projects:

### ChargingStationsMap.Backend
_A **ASP.NET Core Web API** (.NET 10.0) that provides REST endpoints for accessing charging station data._

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


### ChargingStationsMap.Seeder
_A console application for populating the Cosmos DB database with Swiss charging station data._

**Key Features:**
- Database and container initialization
- JSON data file processing
- Batch data insertion

**Technology Stack:**
- .NET 10.0 Console Application
- Azure Cosmos DB SDK

