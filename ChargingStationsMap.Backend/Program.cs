using Microsoft.Azure.Cosmos;
var program = new Program();
await program.RunAsync(args);

public partial class Program
{
    public async Task RunAsync(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        ConfigureServices(builder);
        
        var app = builder.Build();
        
        ConfigureApp(app);
        
        await InitializeDatabaseAsync(app);
        
        app.Run();
    }

    private static void ConfigureServices(WebApplicationBuilder builder)
    {
        builder.Services.Configure<CosmosOptions>(builder.Configuration.GetSection("CosmosDb"));
        
        builder.Services.AddSingleton(sp =>
        {
            var options = builder.Configuration.GetSection("CosmosDb").Get<CosmosOptions>()!;
            
            var clientOptions = new CosmosClientOptions
            {
                MaxRetryAttemptsOnRateLimitedRequests = 9,
                MaxRetryWaitTimeOnRateLimitedRequests = TimeSpan.FromSeconds(30),
                EnableContentResponseOnWrite = false,
                SerializerOptions = new CosmosSerializationOptions
                {
                    PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                }
            };

            return new CosmosClient(options.Endpoint, options.Key, clientOptions);
        });

    private static async Task InitializeDatabaseAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            var options = scope.ServiceProvider.GetRequiredService<IOptions<CosmosOptions>>();
            
            logger.LogInformation("Attempting to connect to Cosmos DB at {Endpoint}", options.Value.Endpoint);
            
            var initializer = new CosmosDbInitializer(
                scope.ServiceProvider.GetRequiredService<CosmosClient>(),
                options,
                scope.ServiceProvider.GetRequiredService<ILogger<CosmosDbInitializer>>()

            );

            await initializer.InitializeAsync();
            
        }
        catch (HttpRequestException ex) when (ex.Message.Contains("10061") || ex.Message.Contains("connexion"))
        {
            logger.LogCritical("""
                Failed to connect to Cosmos DB Emulator. Please ensure the Azure Cosmos DB Emulator is running:
                   - Docker: docker run -p 8081:8081 -p 10250-10255:10250-10255 -m 3g -it mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest
                   - Or install the Windows emulator from: https://aka.ms/cosmosdb-emulator
                """);
            Environment.Exit(1);
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "Failed to initialize Cosmos DB: {Message}.", ex.Message);
            Environment.Exit(1);
        }
    }
}