namespace ChargingStationsMap.Seeder.Utils;

public static class SwissPostalCodeHelper
{
    public static string GetPartitionKeyFromPostalCode(string postalCode)
    {
        if (string.IsNullOrWhiteSpace(postalCode) || !int.TryParse(postalCode, out int code)) 
            return "other";
        
        return code switch
        {
            >= 1000 and <= 1999 => "west-south",
            >= 2000 and <= 2999 => "west-north",
            >= 3000 and <= 3999 => "bern-fribourg",
            >= 4000 and <= 4999 => "basel",
            >= 5000 and <= 5999 => "aargau",
            >= 6000 and <= 6999 => "central-ticino",
            >= 7000 and <= 7999 => "graubuenden",
            >= 8000 and <= 8999 => "zurich",
            >= 9000 and <= 9999 => "east",
            _ => "other"
        };
    }
}
