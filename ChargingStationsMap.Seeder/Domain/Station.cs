using System.Text.Json.Serialization;

namespace ChargingStationsMap.Seeder.Domain;

public class Station
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!;
    
    [JsonPropertyName("partitionKey")]
    public string PartitionKey => Address.PostalCode;
    
    [JsonPropertyName("address")]
    public StationAddress Address { get; set; } = default!;
    
    [JsonPropertyName("chargingStationNames")]
    public List<ChargingStationName> ChargingStationNames { get; set; } = new();
    
    [JsonPropertyName("isOpen24Hours")]
    public bool IsOpen24Hours { get; set; }
    
    [JsonPropertyName("geoCoordinates")]
    public Coordinates Coordinates { get; set; } = default!;
}

public class StationAddress
{
    [JsonPropertyName("city")]
    public string City { get; set; } = default!;
    
    [JsonPropertyName("postalCode")]
    public string PostalCode { get; set; } = default!;
    
    [JsonPropertyName("street")]
    public string Street { get; set; } = default!;
}

public class ChargingStationName
{
    [JsonPropertyName("lang")]
    public string Lang { get; set; } = default!;
    
    [JsonPropertyName("value")]
    public string Value { get; set; } = default!;
}

public class Coordinates
{
    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }
    
    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }
}
