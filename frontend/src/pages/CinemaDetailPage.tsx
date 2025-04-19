import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CinemaService, { CinemaDetail } from '../services/cinema.service';

const CinemaDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [cinema, setCinema] = useState<CinemaDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCinemaDetails = async () => {
            if (!id) {
                setError('Invalid cinema ID');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const cinemaData = await CinemaService.getCinemaById(parseInt(id, 10));

                if (!cinemaData) {
                    setError('Cinema not found');
                } else {
                    setCinema(cinemaData);
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching cinema details:', err);
                setError('Failed to load cinema details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCinemaDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !cinema) {
        return (
            <div className="min-h-screen bg-dark text-white py-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-900/30 border border-red-500 text-white px-6 py-4 rounded-md mb-8">
                        <h2 className="text-xl font-bold mb-2">Error</h2>
                        <p>{error || 'Failed to load cinema details'}</p>
                        <div className="mt-4 flex space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 text-gray-400 hover:text-white"
                    >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold">{cinema.name}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Left column - Cinema image and info */}
                    <div className="lg:col-span-1">
                        <div className="bg-secondary rounded-lg overflow-hidden shadow-lg">
                            <div className="h-60 bg-gray-700">
                                {cinema.imageUrl ? (
                                    <img
                                        src={cinema.imageUrl}
                                        alt={cinema.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                        <svg className="h-24 w-24 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-gray-400 text-sm mb-1">Address</h3>
                                    <p className="text-white">{cinema.address}</p>
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-gray-400 text-sm mb-1">Phone</h3>
                                    <p className="text-white">{cinema.phoneNumber}</p>
                                </div>
                                {cinema.city && (
                                    <div className="mb-4">
                                        <h3 className="text-gray-400 text-sm mb-1">City</h3>
                                        <p className="text-white">{cinema.city}</p>
                                    </div>
                                )}
                                {cinema.description && (
                                    <div className="mb-4">
                                        <h3 className="text-gray-400 text-sm mb-1">Description</h3>
                                        <p className="text-white">{cinema.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Halls</h3>
                                        <p className="text-white">{cinema.hallsCount}</p>
                                    </div>
                                    {cinema.totalSeats !== undefined && (
                                        <div>
                                            <h3 className="text-gray-400 text-sm mb-1">Total Seats</h3>
                                            <p className="text-white">{cinema.totalSeats}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Halls information */}
                    <div className="lg:col-span-2">
                        <div className="bg-secondary rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary">Cinema Halls</h2>

                            {cinema.halls.length === 0 ? (
                                <p className="text-gray-400">No halls information available.</p>
                            ) : (
                                <div className="space-y-4">
                                    {cinema.halls.map(hall => (
                                        <div key={hall.id} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-medium">{hall.name}</h3>
                                                <span className="text-sm text-gray-400">{hall.seatsCount} seats</span>
                                            </div>

                                            {hall.seats && hall.seats.length > 0 ? (
                                                <div className="mt-2">
                                                    <h4 className="text-sm text-gray-400 mb-2">Seating Layout</h4>
                                                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                                        <div className="w-full h-6 bg-gray-800 rounded mb-6 flex items-center justify-center">
                                                            <span className="text-xs text-gray-500">SCREEN</span>
                                                        </div>

                                                        {/* Group seats by row */}
                                                        {Array.from(new Set(hall.seats.map(seat => seat.row))).sort().map(row => (
                                                            <div key={row} className="flex flex-wrap justify-center mb-2">
                                                                <div className="w-6 text-gray-500 text-xs flex items-center justify-center mr-2">
                                                                    {row}
                                                                </div>
                                                                {hall.seats
                                                                    ?.filter(seat => seat.row === row)
                                                                    .sort((a, b) => a.seatNumber - b.seatNumber)
                                                                    .map(seat => (
                                                                        <div
                                                                            key={seat.id}
                                                                            className={`w-6 h-6 m-1 rounded-sm flex items-center justify-center text-xs bg-gray-700 text-white`}
                                                                        >
                                                                            {seat.seatNumber}
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No detailed seating information available</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-center mt-4">
                    <Link
                        to={`/movies?cinema=${cinema.id}`}
                        className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition"
                    >
                        View Movies at This Cinema
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CinemaDetailPage; 