using ChargingStationsMap.Backend.Repositories;

namespace ChargingStationsMap.Backend.Services
{
    public class ChargingStationsService(IChargingStationsRepository repository) : IChargingStationsService
    {
        private readonly IChargingStationsRepository _repository = repository;

        public async Task<IEnumerable<Dto.StationPosition>> GetAllStationsAsync()
        {
            var stations = await _repository.GetAllStationsPositions();

            return stations;
        }
    }
}