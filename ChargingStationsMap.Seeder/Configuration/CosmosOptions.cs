namespace ChargingStationsMap.Seeder.Configuration;

public class CosmosOptions
{
    public string Endpoint { get; set; } = default!;
    public string Key { get; set; } = default!;
    public string DatabaseName { get; set; } = default!;
    public string ContainerName { get; set; } = default!;
    public int MaxStationsToSeed { get; set; } = 100;
    public int BatchSize { get; set; } = 50;
}
