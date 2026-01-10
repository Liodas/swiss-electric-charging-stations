var program = new Program();
await program.RunAsync(args);

public partial class Program
{
    public async Task RunAsync(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        var app = builder.Build();
        
        app.Run();
    }
