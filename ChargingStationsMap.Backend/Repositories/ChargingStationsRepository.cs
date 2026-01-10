using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

namespace ChargingStationsMap.Backend.Repositories
{
    public class ChargingStationsRepository : IChargingStationsRepository
    {
        private readonly Container _container;

        public ChargingStationsRepository(CosmosClient cosmosClient, IOptions<CosmosOptions> cosmosDbSettings)
        {
            var config = cosmosDbSettings.Value;
            var database = cosmosClient.GetDatabase(config.DatabaseName);
            _container = database.GetContainer(config.ContainerName);
        }

        public async Task<IEnumerable<Dto.StationPosition>> GetAllStationsPositions()
        {
            var query = "SELECT c.id, c.coordinates.latitude, c.coordinates.longitude FROM c";
            var queryDefinition = new QueryDefinition(query);
            
            var queryRequestOptions = new QueryRequestOptions
            {
                MaxItemCount = -1
            };
            
            var queryResultSetIterator = _container.GetItemQueryIterator<Dto.StationPosition>(
                queryDefinition, 
                requestOptions: queryRequestOptions);

            var stations = new List<Dto.StationPosition>();
            while (queryResultSetIterator.HasMoreResults)
            {
                var currentResultSet = await queryResultSetIterator.ReadNextAsync();
                stations.AddRange(currentResultSet);
            }

            return stations;
        }
}