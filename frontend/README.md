# CineTicket Frontend

This is the frontend web application for the CineTicket cinema ticket booking system.

## Technologies Used

- React.js 19
- TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication

## Features

- Browse movies and cinemas
- View movie details and showtimes
- Book tickets for movie screenings
- User authentication (login/register)
- View booking history
- Modern and responsive UI

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd cineticket-frontend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

The application will be available at http://localhost:3000

## Connecting to the Backend

By default, the frontend is configured to connect to the backend API running at `http://localhost:5080`. If your backend is running on a different URL, you'll need to update the `API_URL` in `src/services/api.ts`.

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components for different routes
- `src/services`: API services for communication with the backend
- `src/assets`: Static assets like images and icons

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs tests
- `npm eject`: Ejects from create-react-app

## Learn More

To learn more about the technologies used, check out the following resources:

- [React.js](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
