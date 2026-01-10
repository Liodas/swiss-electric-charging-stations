using ChargingStationsMap.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChargingStationsMap.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChargingStationsController : ControllerBase
{
    private readonly IChargingStationsService _service;

    public ChargingStationsController(IChargingStationsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllStations()
    {
        var stations = await _service.GetAllStationsAsync();
        return Ok(stations);
    }

    [HttpGet("postalCode")]
    public async Task<IActionResult> GetStationsByPostalCode([FromQuery] string postalCode, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1)
            return BadRequest("Page must be greater than 0.");
        
        if (pageSize < 1 || pageSize > 100)
            return BadRequest("Page size must be between 1 and 100.");
        
        var paginatedStations = await _service.GetStationsByPostalCodeAsync(postalCode, page, pageSize);
        return Ok(paginatedStations);
    }
}