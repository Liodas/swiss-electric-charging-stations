using System.Text.Json.Serialization;

namespace ChargingStationsMap.Seeder.Infrastructure.JsonModels;

internal class OperatorData
{
    [JsonPropertyName("EVSEDataRecord")]
    public List<EVSERecord>? EVSEDataRecord { get; set; }
    
    [JsonPropertyName("OperatorID")]
    public string? OperatorID { get; set; }
    
    [JsonPropertyName("OperatorName")]
    public string? OperatorName { get; set; }
}

internal class EVSERecord
{
    [JsonPropertyName("ChargingStationId")]
    public string? ChargingStationId { get; set; }
    
    [JsonPropertyName("EvseID")]
    public string? EvseID { get; set; }
    
    [JsonPropertyName("ChargingStationNames")]
    public List<RawChargingStationName>? ChargingStationNames { get; set; }
    
    [JsonPropertyName("Address")]
    public RawAddress? Address { get; set; }
    
    [JsonPropertyName("IsOpen24Hours")]
    public bool IsOpen24Hours { get; set; }
    
    [JsonPropertyName("GeoCoordinates")]
    public RawGeoCoordinates? GeoCoordinates { get; set; }
}

internal class RawChargingStationName
{
    [JsonPropertyName("lang")]
    public string? Lang { get; set; }
    
    [JsonPropertyName("value")]
    public string? Value { get; set; }
}

internal class RawAddress
{
    [JsonPropertyName("City")]
    public string? City { get; set; }
    
    [JsonPropertyName("PostalCode")]
    public string? PostalCode { get; set; }
    
    [JsonPropertyName("Street")]
    public string? Street { get; set; }
}

internal class RawGeoCoordinates
{
    [JsonPropertyName("Google")]
    public string? Google { get; set; }
}
