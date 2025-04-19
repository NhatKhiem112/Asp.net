# CineTicket API

This is the backend API for the CineTicket cinema ticket booking application.

## Technologies Used

- ASP.NET Core 8.0 Web API
- Entity Framework Core 7.0.2
- MySQL Database (using Pomelo.EntityFrameworkCore.MySql)
- JWT Authentication

## Setup Instructions

### Prerequisites

- .NET 8.0 SDK
- MySQL Server

### Configuration

1. Update the connection string in `appsettings.json` to match your MySQL server configuration:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=CineTicket;User=root;Password=password;"
}
```

2. Make sure the JWT settings in `appsettings.json` are secure for your environment:

```json
"JWT": {
  "Key": "SuperSecretKeyForJWTTokenGeneration123!@#",
  "Issuer": "CineTicketAPI",
  "Audience": "CineTicketClient",
  "ExpiryInMinutes": 60
}
```

### Database Migration

To create the database and apply migrations, run the following commands:

```bash
cd CineTicket.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Running the API

```bash
cd CineTicket.API
dotnet run
```

The API will be available at:
- https://localhost:7080 (HTTPS)
- http://localhost:5080 (HTTP)

## API Endpoints

### Authentication

- `POST /api/Auth/register` - Register a new user
- `POST /api/Auth/login` - Login and get token
- `PUT /api/Auth/change-password` - Change password (requires authentication)

### Movies

- `GET /api/Movies` - Get all movies
- `GET /api/Movies/{id}` - Get movie by ID
- `POST /api/Movies` - Create a new movie
- `PUT /api/Movies/{id}` - Update a movie
- `DELETE /api/Movies/{id}` - Delete a movie

### Cinemas

- `GET /api/Cinemas` - Get all cinemas
- `GET /api/Cinemas/{id}` - Get cinema by ID with halls
- `POST /api/Cinemas` - Create a new cinema
- `PUT /api/Cinemas/{id}` - Update a cinema
- `DELETE /api/Cinemas/{id}` - Delete a cinema

### Screenings

- `GET /api/Screenings` - Get all screenings
- `GET /api/Screenings/{id}` - Get screening by ID
- `GET /api/Screenings/Movie/{movieId}` - Get screenings by movie
- `GET /api/Screenings/Cinema/{cinemaId}` - Get screenings by cinema
- `POST /api/Screenings` - Create a new screening
- `PUT /api/Screenings/{id}` - Update a screening
- `DELETE /api/Screenings/{id}` - Delete a screening

### Bookings (requires authentication)

- `GET /api/Bookings` - Get current user's bookings
- `GET /api/Bookings/{id}` - Get booking by ID
- `POST /api/Bookings` - Create a new booking
- `PUT /api/Bookings/{id}/cancel` - Cancel a booking
- `GET /api/Bookings/Admin` - Get all bookings (admin only) 