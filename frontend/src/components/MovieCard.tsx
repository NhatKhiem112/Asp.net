import React from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../services/movie.service';

interface MovieCardProps {
    movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    // Format the release date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Format the duration to hours and minutes
    const formatDuration = (minutes: number | undefined | null) => {
        if (minutes === undefined || minutes === null || isNaN(minutes)) {
            return 'Duration N/A';
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Extract first three genres if available
    const displayGenres = movie.genres?.split(',').slice(0, 3).join(', ') || movie.genre || '';

    return (
        <div className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 h-full flex flex-col">
            <div className="relative">
                <img
                    src={movie.posterUrl || '/placeholder-poster.jpg'}
                    alt={movie.title}
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
                    }}
                />
                <div className="absolute top-0 right-0 bg-primary text-white px-2 py-1 m-2 rounded text-xs font-bold">
                    {movie.rating}/10
                </div>
            </div>

            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 flex-grow">{movie.title}</h3>

                <div className="text-gray-400 text-sm mb-2">
                    <span>{formatDate(movie.releaseDate)}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDuration(movie.durationMinutes)}</span>
                </div>

                {(movie.genres || movie.genre) && (
                    <p className="text-gray-300 text-xs mb-3">{displayGenres || movie.genre}</p>
                )}

                <Link
                    to={`/movies/${movie.id}`}
                    className="block w-full text-center bg-primary text-white py-2 rounded-md hover:bg-red-700 transition mt-auto"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default MovieCard; 