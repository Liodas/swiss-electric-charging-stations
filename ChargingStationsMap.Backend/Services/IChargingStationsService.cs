namespace ChargingStationsMap.Backend.Services
{
    public interface IChargingStationsService
    {
        Task<IEnumerable<Dto.StationPosition>> GetAllStationsAsync();
    }
}