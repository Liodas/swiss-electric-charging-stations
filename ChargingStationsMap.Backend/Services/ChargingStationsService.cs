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

        public async Task<Dto.PaginatedResult<Dto.Station>> GetStationsByPostalCodeAsync(string postalCode, int page, int pageSize)
        {
            var paginatedStations = await _repository.GetStationsByPostalCodeAsync(postalCode, page, pageSize);

            var stations = paginatedStations.Items
                .Select(Dto.StationHelpers.FromDomain)
                .Cast<Dto.Station>()
                .ToList();

            return new Dto.PaginatedResult<Dto.Station>
            {
                Items = stations,
                TotalCount = paginatedStations.TotalCount,
                Page = paginatedStations.Page,
                PageSize = paginatedStations.PageSize,
                TotalPages = paginatedStations.TotalPages,
                HasNextPage = paginatedStations.HasNextPage,
                HasPreviousPage = paginatedStations.HasPreviousPage
            };
        }
    }
}