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
                requestOptions: queryRequestOptions
            );

            var stations = new List<Dto.StationPosition>();
            while (queryResultSetIterator.HasMoreResults)
            {
                var currentResultSet = await queryResultSetIterator.ReadNextAsync();
                stations.AddRange(currentResultSet);
            }

            return stations;
        }

        public async Task<Dto.PaginatedResult<Domain.Station>> GetStationsByPostalCodeAsync(string postalCode, int page, int pageSize)
        {
            var countQuery = "SELECT VALUE COUNT(1) FROM c WHERE c.partitionKey = @postalCode";
            var countQueryDefinition = new QueryDefinition(countQuery)
                .WithParameter("@postalCode", postalCode);
            
            var countQueryRequestOptions = new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(postalCode),
            };
            
            var countQueryIterator = _container.GetItemQueryIterator<int>(
                countQueryDefinition, 
                requestOptions: countQueryRequestOptions);

            var totalCount = 0;
            while (countQueryIterator.HasMoreResults)
            {
                var countResult = await countQueryIterator.ReadNextAsync();
                totalCount = countResult.FirstOrDefault();
            }

            var skip = (page - 1) * pageSize;
            var query = "SELECT * FROM c WHERE c.partitionKey = @postalCode OFFSET @skip LIMIT @take";
            var queryDefinition = new QueryDefinition(query)
                .WithParameter("@postalCode", postalCode)
                .WithParameter("@skip", skip)
                .WithParameter("@take", pageSize);

            var queryRequestOptions = new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(postalCode),
            };
            
            var queryResultSetIterator = _container.GetItemQueryIterator<Domain.Station>(
                queryDefinition, 
                requestOptions: queryRequestOptions);

            var stations = new List<Domain.Station>();
            while (queryResultSetIterator.HasMoreResults)
            {
                var currentResultSet = await queryResultSetIterator.ReadNextAsync();
                stations.AddRange(currentResultSet);
            }

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return new Dto.PaginatedResult<Domain.Station>
            {
                Items = stations,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasNextPage = page < totalPages,
                HasPreviousPage = page > 1
            };
        }
    }
}