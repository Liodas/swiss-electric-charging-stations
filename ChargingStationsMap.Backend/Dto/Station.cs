namespace ChargingStationsMap.Backend.Dto;

public record Station (
    string Id,
    string Name, 
    string Address, 
    bool IsOpen24Hours
);

public static class StationHelpers
{
    public static Station? FromDomain(this Domain.Station? station)
    {
        if (station == null || station.Address == null || station.Coordinates == null)
            return null;

        string address = station.Address.PostalCode == "0"
            ? $"{station.Address.Street ?? ""}, {station.Address.City ?? ""}" 
            : $"{station.Address.Street ?? ""}, {station.Address.PostalCode} {station.Address.City ?? ""}"; 

        return new Station(
            station.Id ?? "",
            station.ChargingStationNames?.FirstOrDefault()?.Value ?? "Unknown",
            address,
            station.IsOpen24Hours
        );
    }
}