import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MovieService, { Movie } from '../services/movie.service';
import MovieCard from '../components/MovieCard';

const MoviesPage: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get('filter');

    useEffect(() => {
        // Set the filter based on the URL parameter
        if (filterParam) {
            setSelectedCategory(filterParam);
        }
    }, [filterParam]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setIsLoading(true);

                let movieData: Movie[] = [];

                // Fetch appropriate movies based on selected category
                switch (selectedCategory) {
                    case 'now-showing':
                        movieData = await MovieService.getNowShowingMovies();
                        break;
                    case 'coming-soon':
                        movieData = await MovieService.getComingSoonMovies();
                        break;
                    default:
                        movieData = await MovieService.getAllMovies();
                }

                setMovies(movieData);
                setError(null);
            } catch (err) {
                console.error('Error fetching movies:', err);
                setError('Failed to load movies. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, [selectedCategory]);

    // Extract unique genres from movies
    const genres = [...new Set(movies
        .filter(movie => movie.genres || movie.genre) // Filter movies that have either genres or genre
        .map(movie => {
            if (movie.genres) {
                return movie.genres.split(',').map(g => g.trim());
            } else if (movie.genre) {
                return [movie.genre.trim()];
            }
            return [];
        })
        .flat())];

    // Filter movies based on search term and selected genre
    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (movie.description && movie.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesGenre = selectedGenre === '' ||
            (movie.genres && movie.genres.toLowerCase().includes(selectedGenre.toLowerCase())) ||
            (movie.genre && movie.genre.toLowerCase() === selectedGenre.toLowerCase());

        return matchesSearch && matchesGenre;
    });

    return (
        <div className="bg-dark min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">
                    {selectedCategory === 'now-showing' ? 'Now Showing' :
                        selectedCategory === 'coming-soon' ? 'Coming Soon' :
                            'All Movies'}
                </h1>

                {/* Category Tabs */}
                <div className="mb-8">
                    <div className="flex border-b border-gray-700">
                        <button
                            className={`py-2 px-4 font-medium text-sm rounded-t-md ${selectedCategory === 'all'
                                ? 'bg-primary text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            All Movies
                        </button>
                        <button
                            className={`py-2 px-4 font-medium text-sm rounded-t-md ${selectedCategory === 'now-showing'
                                ? 'bg-primary text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            onClick={() => setSelectedCategory('now-showing')}
                        >
                            Now Showing
                        </button>
                        <button
                            className={`py-2 px-4 font-medium text-sm rounded-t-md ${selectedCategory === 'coming-soon'
                                ? 'bg-primary text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            onClick={() => setSelectedCategory('coming-soon')}
                        >
                            Coming Soon
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="md:w-2/3">
                        <input
                            type="text"
                            placeholder="Search movies by title or description..."
                            className="w-full px-4 py-2 rounded-md bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:w-1/3">
                        <select
                            className="w-full px-4 py-2 rounded-md bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        >
                            <option value="">All Genres</option>
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Movie Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/30 border border-red-500 text-white px-6 py-4 rounded-md my-8">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 bg-primary text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredMovies.length === 0 ? (
                    <div className="bg-secondary/50 rounded-lg p-8 text-center my-12">
                        <p className="text-gray-400">No movies found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredMovies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoviesPage;
