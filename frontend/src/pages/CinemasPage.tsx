import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CinemaService, { Cinema } from '../services/cinema.service';

const CinemasPage: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                setIsLoading(true);
                const data = await CinemaService.getAllCinemas();
                setCinemas(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching cinemas:', err);
                setError('Failed to load cinemas. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCinemas();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-dark text-white py-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-900/30 border border-red-500 text-white px-6 py-4 rounded-md mb-8">
                        <h2 className="text-xl font-bold mb-2">Error</h2>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 bg-primary text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Our Cinemas</h1>

                {cinemas.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-400">No cinemas found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cinemas.map((cinema) => (
                            <div key={cinema.id} className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                                <div className="h-48 bg-gray-700 relative">
                                    {cinema.imageUrl ? (
                                        <img
                                            src={cinema.imageUrl}
                                            alt={cinema.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                            <svg className="h-20 w-20 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-2 text-primary">{cinema.name}</h2>
                                    <p className="text-gray-300 mb-1">{cinema.address}</p>
                                    <p className="text-gray-400 text-sm mb-1">
                                        <span className="font-medium">Tel:</span> {cinema.phoneNumber}
                                    </p>
                                    {cinema.city && (
                                        <p className="text-gray-400 text-sm mb-4">{cinema.city}</p>
                                    )}

                                    {cinema.description && (
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{cinema.description}</p>
                                    )}

                                    <div className="flex justify-between text-sm text-gray-400 mb-4">
                                        <span>{cinema.hallsCount} Halls</span>
                                    </div>

                                    <Link
                                        to={`/cinemas/${cinema.id}`}
                                        className="block w-full text-center bg-primary text-white py-2 rounded-md hover:bg-red-700 transition"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CinemasPage; 