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
    public async Task<IActionResult> GetStationsByPostalCode([FromQuery] string postalCode, [FromQuery] int page = 1, [FromQuery] int pageSize = 9)
    {
        if (page < 1)
            return BadRequest("Page must be greater than 0.");
        
        if (pageSize < 1 || pageSize > 9)
            return BadRequest("Page size must be between 1 and 9.");
        
        var paginatedStations = await _service.GetStationsByPostalCodeAsync(postalCode, page, pageSize);
        return Ok(paginatedStations);
    }

    [HttpGet("{stationId}")]
    public async Task<IActionResult> GetStationById(string stationId)
    {
        if (string.IsNullOrWhiteSpace(stationId))
            return BadRequest("Station ID cannot be null or empty.");
            
        var station = await _service.GetStationByIdAsync(stationId);
        
        if (station == null)
            return NotFound($"Station with ID '{stationId}' not found.");
            
        return Ok(station);
    }
}