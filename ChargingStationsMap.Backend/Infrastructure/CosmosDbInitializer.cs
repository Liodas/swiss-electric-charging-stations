using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

namespace ChargingStationsMap.Backend.Infrastructure;

public class CosmosDbInitializer(CosmosClient cosmosClient, IOptions<CosmosOptions> options, ILogger<CosmosDbInitializer> logger)
{
    private readonly CosmosClient _client = cosmosClient;
    private readonly CosmosOptions _options = options.Value;
    private readonly ILogger<CosmosDbInitializer> _logger = logger;

    public async Task InitializeAsync()
    {
        try
        {
            var databaseToDelete = _client.GetDatabase(_options.DatabaseName);
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogInformation("Database {DatabaseName} doesn't exist. Please run the `ChargingStationsMap.Seeder` project if not done yet.", _options.DatabaseName);
        }

        var database = await _client.CreateDatabaseIfNotExistsAsync(
            _options.DatabaseName
        );

        await database.Database.CreateContainerIfNotExistsAsync(
            id: _options.ContainerName,
            partitionKeyPath: "/partitionKey"
        );

        _logger.LogInformation(
            "Initialized database: {DatabaseName} with container: {ContainerName}", 
            _options.DatabaseName, _options.ContainerName);
    }
}