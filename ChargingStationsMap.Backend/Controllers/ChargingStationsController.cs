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

    [HttpGet("/")]
    public async Task<IActionResult> GetAllStations()
    {
        var stations = await _service.GetAllStationsAsync();
        return Ok(stations);
    }
}