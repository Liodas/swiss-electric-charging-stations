namespace ChargingStationsMap.Backend.Repositories
{
    public interface IChargingStationsRepository
    {
        Task<IEnumerable<Dto.StationPosition>> GetAllStationsPositions();
        Task<Dto.PaginatedResult<Domain.Station>> GetStationsByPostalCodeAsync(string postalCode, int page, int pageSize);
        Task<Domain.Station?> GetStationByIdAsync(string stationId);
    }
}