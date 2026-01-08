# ChargingStationsMap.Seeder

A standalone CLI application for seeding Swiss electric charging station data into Azure Cosmos DB.

## Overview

This application reads charging station data from a JSON file and populates a Cosmos DB database with the data. It's designed to be run independently from the main backend application using the `dotnet run` command.

## Features

- **Database Initialization**: Creates and initializes the Cosmos DB database and container
- **Data Seeding**: Reads charging station data from JSON and populates the database
- **Batch Processing**: Processes data in batches for optimal performance
- **Logging**: Provides detailed logging of the seeding process
- **Error Handling**: Gracefully handles errors during data insertion

## Configuration

The application uses configuration files for Cosmos DB connection settings:

### appsettings.json / appsettings.Development.json

```json
{
  "CosmosOptions": {
    "Endpoint": "https://localhost:8081",
    "Key": "YOUR_KEY",
    "DatabaseName": "ChargingStations",
    "ContainerName": "stations"
  }
}
```

The default configuration is set up for the Azure Cosmos DB Emulator. For production use, update these values to point to your Azure Cosmos DB account.

## Data File

The application expects a `charging-stations.json` file in the `Data` directory. This file should contain the charging station data in the expected format.
It can be found at the following address:

https://data.geo.admin.ch/ch.bfe.ladestellen-elektromobilitaet/data/oicp/ch.bfe.ladestellen-elektromobilitaet.json

## Building and Running

### Prerequisites
- .NET 10.0 SDK
- Azure Cosmos DB Emulator (for local development) or access to Azure Cosmos DB

### Build the project:
```bash
dotnet build
```

### Run the project:
```bash
dotnet run
```
