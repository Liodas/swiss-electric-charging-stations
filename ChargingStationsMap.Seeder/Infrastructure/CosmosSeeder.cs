using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

using ChargingStationsMap.Seeder.Configuration;
using ChargingStationsMap.Seeder.Domain;
using ChargingStationsMap.Seeder.Infrastructure.JsonModels;

namespace ChargingStationsMap.Seeder.Infrastructure;

public class CosmosSeeder
{
    private readonly Container _container;
    private readonly ILogger<CosmosSeeder> _logger;

    public CosmosSeeder(CosmosClient cosmosClient, IOptions<CosmosOptions> options, ILogger<CosmosSeeder> logger)
    {
        var database = cosmosClient.GetDatabase(options.Value.DatabaseName);
        _container = database.GetContainer(options.Value.ContainerName);
        _logger = logger;
    }

    public async Task SeedAsync(string filePath)
    {
        var fullPath = Path.Combine(AppContext.BaseDirectory, "Data", filePath);

        if (!File.Exists(fullPath))
        {
            _logger.LogWarning("Charging stations JSON file not found at {FilePath}", fullPath);
            return;
        }

        var jsonData = await File.ReadAllTextAsync(fullPath);
        if (string.IsNullOrWhiteSpace(jsonData))
        {
            _logger.LogWarning("Charging stations JSON file is empty");
            return;
        }
        
        try
        {
            var stations = await ParseStationsFromJson(jsonData);
            
            // Limit to 100 stations for testing to avoid overwhelming the emulator
            var limitedStations = stations.Take(100).ToList();
            await BulkInsertStations(limitedStations);
            
            _logger.LogInformation("Successfully seeded {Count} charging stations (limited from {OriginalCount} for testing)", 
                limitedStations.Count, stations.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding charging stations data");
            throw;
        }
    }

    private async Task<List<Station>> ParseStationsFromJson(string jsonData)
    {
        var jsonElement = JsonSerializer.Deserialize<JsonElement>(jsonData);
        
        if (!jsonElement.TryGetProperty("EVSEData", out var evseDataElement))
        {
            throw new InvalidDataException("EVSEData property not found in JSON");
        }

        var options = new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };
        var stationIds = new HashSet<string>();
        var stations = new List<Station>();
        
        foreach (var operatorElement in evseDataElement.EnumerateArray())
        {
            try
            {
                var operatorData = JsonSerializer.Deserialize<OperatorData>(operatorElement.GetRawText(), options);
                if (operatorData?.EVSEDataRecord == null) continue;
                
                foreach (var evseRecord in operatorData.EVSEDataRecord)
                {
                    var station = MapToStation(evseRecord);
                    
                    if (station != null && stationIds.Add(station.Id))
                        stations.Add(station);
                }
            }
            catch (JsonException ex)
            {
                _logger.LogWarning("Failed to parse operator data: {Error}", ex.Message);
                continue;
            }
        }
        
        return stations;
    }

    private static Station? MapToStation(EVSERecord evseRecord)
    {
        if (string.IsNullOrWhiteSpace(evseRecord.GeoCoordinates?.Google) || 
            evseRecord.GeoCoordinates.Google == "0 0")
            return null;

        var stationId = !string.IsNullOrWhiteSpace(evseRecord.ChargingStationId) 
            ? evseRecord.ChargingStationId 
            : evseRecord.EvseID ?? Guid.NewGuid().ToString();

        var coords = evseRecord.GeoCoordinates.Google.Split(' ');
        var latitude = coords.Length > 0 && double.TryParse(coords[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var lat) ? lat : 0;
        var longitude = coords.Length > 1 && double.TryParse(coords[1], NumberStyles.Float, CultureInfo.InvariantCulture, out var lng) ? lng : 0;

        if (latitude == 0 || longitude == 0)
            return null;

        return new Station
        {
            Id = stationId,
            Address = new StationAddress
            {
                Street = evseRecord.Address?.Street ?? "Unknown",
                City = evseRecord.Address?.City ?? "Unknown", 
                PostalCode = evseRecord.Address?.PostalCode ?? "Unknown"
            },
            ChargingStationNames = evseRecord.ChargingStationNames?
                .Where(name => !string.IsNullOrWhiteSpace(name.Value))
                .Select(name => new ChargingStationName
                {
                    Lang = name.Lang ?? "en",
                    Value = name.Value!
                }).ToList() ?? new List<ChargingStationName>(),
            IsOpen24Hours = evseRecord.IsOpen24Hours,
            GeoCoordinates = new GeoCoordinates
            {
                Latitude = latitude,
                Longitude = longitude
            }
        };
    }

    private async Task BulkInsertStations(List<Station> stations)
    {
        int batchSize = 50;

        _logger.LogInformation("Inserting {TotalStations} stations in batches of {BatchSize}", stations.Count, batchSize);

        var successCount = 0;
        var failCount = 0;

        for (int i = 0; i < stations.Count; i += batchSize)
        {
            var batch = stations.Skip(i).Take(batchSize);
            var batchNumber = (i / batchSize) + 1;
            var totalBatches = (int)Math.Ceiling((double)stations.Count / batchSize);

            _logger.LogInformation("Processing batch {BatchNumber}/{TotalBatches}", batchNumber, totalBatches);

            var tasks = batch.Select(async station =>
            {
                try
                {
                    await _container.UpsertItemAsync(station, new PartitionKey(station.PartitionKey));
                    Interlocked.Increment(ref successCount);
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    Interlocked.Increment(ref failCount);
                    _logger.LogWarning("Rate limited for station {StationId}", station.Id);
                }
                catch (Exception ex)
                {
                    Interlocked.Increment(ref failCount);
                    _logger.LogWarning(ex, "Failed to insert station {StationId}", station.Id);
                }
            });

            await Task.WhenAll(tasks);
        }

        _logger.LogInformation("Bulk insert completed. Success: {SuccessCount}, Failed: {FailCount}, Total: {TotalCount}", 
            successCount, failCount, stations.Count);
    }
}