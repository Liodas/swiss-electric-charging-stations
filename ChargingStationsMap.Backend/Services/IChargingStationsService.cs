namespace ChargingStationsMap.Backend.Services
{
    public interface IChargingStationsService
    {
        Task<IEnumerable<Dto.StationPosition>> GetAllStationsAsync();
        Task<Dto.PaginatedResult<Dto.Station>> GetStationsByPostalCodeAsync(string postalCode, int page, int pageSize);
    }
}