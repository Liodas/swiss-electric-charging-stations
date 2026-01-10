namespace ChargingStationsMap.Backend.Repositories
{
    public interface IChargingStationsRepository
    {
        Task<IEnumerable<Dto.StationPosition>> GetAllStationsPositions();
    }
}