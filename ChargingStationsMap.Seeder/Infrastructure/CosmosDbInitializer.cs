using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using ChargingStationsMap.Seeder.Configuration;

namespace ChargingStationsMap.Seeder.Infrastructure;

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
            await databaseToDelete.DeleteAsync();
            _logger.LogInformation("Deleted existing database: {DatabaseName}", _options.DatabaseName);
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogInformation("Database {DatabaseName} doesn't exist, creating new one", _options.DatabaseName);
        }

        var database = await _client.CreateDatabaseIfNotExistsAsync(
            _options.DatabaseName
        );

        await database.Database.CreateContainerIfNotExistsAsync(
            id: _options.ContainerName,
            partitionKeyPath: "/partitionKey"
        );

        _logger.LogInformation("Initialized database: {DatabaseName} with container: {ContainerName}", 
            _options.DatabaseName, _options.ContainerName);
    }
}