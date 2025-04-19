import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Film, MapPin, Clock, DollarSign, Save, ArrowLeft, AlertCircle } from 'react-feather';
import ScreeningsService, { AdminScreeningDTO, ScreeningUpdateDTO } from '../../services/screenings.service';
import MoviesService from '../../services/movies.service';
import CinemasService from '../../services/cinemas.service';
import CinemaHallsService from '../../services/cinemaHalls.service';
import AdminLayout from '../../layouts/AdminLayout';

interface Movie {
    id: number;
    title: string;
    durationMinutes: number;
    releaseDate: string;
}

interface Cinema {
    id: number;
    name: string;
}

interface CinemaHall {
    id: number;
    name: string;
    cinemaId: number;
}

const ScreeningFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState<AdminScreeningDTO | ScreeningUpdateDTO>({
        movieId: 0,
        cinemaHallId: 0,
        startTime: new Date(),
        price: 0,
    });

    // Selected movie and cinema state for UI
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [selectedCinema, setSelectedCinema] = useState<number | null>(null);

    // Data for dropdowns
    const [movies, setMovies] = useState<Movie[]>([]);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [cinemaHalls, setCinemaHalls] = useState<CinemaHall[]>([]);
    const [filteredHalls, setFilteredHalls] = useState<CinemaHall[]>([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Time handling
    const timeZoneOffset = new Date().getTimezoneOffset() * 60000; // offset in milliseconds
    const currentDateTime = new Date(Date.now() - timeZoneOffset).toISOString().slice(0, 16);

    useEffect(() => {
        async function initialize() {
            await fetchDropdownData();
            if (isEditMode) {
                fetchScreeningData();
            }
        }
        initialize();
    }, []);

    // When cinema selection changes, filter the cinema halls
    useEffect(() => {
        if (selectedCinema) {
            setFilteredHalls(cinemaHalls.filter(hall => hall.cinemaId === selectedCinema));

            // If the current selected hall doesn't belong to the new cinema, reset it
            if (formData.cinemaHallId) {
                const hallBelongsToCinema = cinemaHalls.some(
                    hall => hall.id === formData.cinemaHallId && hall.cinemaId === selectedCinema
                );
                if (!hallBelongsToCinema) {
                    setFormData(prev => ({ ...prev, cinemaHallId: 0 }));
                }
            }
        } else {
            setFilteredHalls(cinemaHalls);
        }
    }, [selectedCinema, cinemaHalls]);

    // When movie selection changes, update the selected movie details
    useEffect(() => {
        if (formData.movieId) {
            const movie = movies.find(m => m.id === formData.movieId);
            if (movie) {
                setSelectedMovie(movie);
            }
        } else {
            setSelectedMovie(null);
        }
    }, [formData.movieId, movies]);

    const fetchDropdownData = async () => {
        try {
            // Fetch movies for dropdown
            const moviesData = await MoviesService.getMovies('', 1, 100);
            setMovies(moviesData.movies);

            // Fetch cinemas for dropdown
            const cinemasData = await CinemasService.getCinemas('', 1, 100);
            setCinemas(cinemasData.cinemas);

            // Fetch cinema halls for dropdown
            const hallsData = await CinemaHallsService.getHalls('', 1, 100);
            setCinemaHalls(hallsData.halls);
            setFilteredHalls(hallsData.halls);

            return true;
        } catch (err) {
            console.error('Error fetching dropdown data:', err);
            setError('Failed to load necessary data. Please try again.');
            return false;
        }
    };

    const fetchScreeningData = async () => {
        try {
            setLoading(true);
            const screening = await ScreeningsService.getScreening(parseInt(id as string));

            // Get the raw start time without adjustments
            const startTimeDate = new Date(screening.startTime);

            // Set form data with the original time from database
            setFormData({
                movieId: screening.movieId,
                cinemaHallId: screening.cinemaHallId,
                startTime: startTimeDate,
                price: screening.price,
            });

            // Find and set the cinema ID from the hall
            const hall = cinemaHalls.find(h => h.id === screening.cinemaHallId);
            if (hall) {
                setSelectedCinema(hall.cinemaId);
            }

            setLoading(false);
        } catch (err) {
            setError('Failed to load screening data. Please try again.');
            setLoading(false);
        }
    };

    // Add a second useEffect to handle initial cinema selection
    useEffect(() => {
        // When in edit mode and cinema halls are loaded, find the cinema for the selected hall
        if (isEditMode && cinemaHalls.length > 0 && formData.cinemaHallId && !selectedCinema) {
            const hall = cinemaHalls.find(h => h.id === formData.cinemaHallId);
            if (hall) {
                setSelectedCinema(hall.cinemaId);
            }
        }
    }, [isEditMode, cinemaHalls, formData.cinemaHallId, selectedCinema]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'cinemaId') {
            // When cinema changes, update the selected cinema
            setSelectedCinema(value ? parseInt(value) : null);
        } else {
            // For other select fields
            setFormData({
                ...formData,
                [name]: parseInt(value),
            });
        }

        // Mark field as touched
        setTouched({
            ...touched,
            [name]: true,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        if (name === 'startTime') {
            // For startTime, when user selects a time in the local timezone, 
            // we need to convert it to UTC for consistent storage
            const localDate = new Date(value);

            setFormData({
                ...formData,
                [name]: localDate
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'number' ? parseFloat(value) : value,
            });
        }

        // Mark field as touched
        setTouched({
            ...touched,
            [name]: true,
        });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true,
        });
    };

    const validate = (): boolean => {
        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            { cinemaId: true } // Also mark cinemaId as touched
        );
        setTouched(allTouched);

        // Validate movie selection
        if (!formData.movieId) {
            setError('Please select a movie');
            return false;
        }

        // Validate cinema hall selection
        if (!formData.cinemaHallId) {
            setError('Please select a cinema hall');
            return false;
        }

        // Validate start time
        if (!formData.startTime) {
            setError('Please select a start time');
            return false;
        }

        // Validate price
        if (!formData.price || formData.price <= 0) {
            setError('Please enter a valid price');
            return false;
        }

        // Validate start time is in the future
        const now = new Date();
        const startTime = new Date(formData.startTime);
        if (startTime <= now) {
            setError('Start time must be in the future');
            return false;
        }

        // If movie is selected, check if start time is after release date
        if (selectedMovie && selectedMovie.releaseDate) {
            const releaseDate = new Date(selectedMovie.releaseDate);
            if (startTime < releaseDate) {
                setError(`Start time must be on or after the movie's release date (${releaseDate.toLocaleDateString()})`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // Prepare data for API - use the original time without adjustments
            const apiData = {
                ...formData,
                startTime: formData.startTime,
            };

            if (isEditMode) {
                await ScreeningsService.updateScreening(parseInt(id as string), apiData);
                setSuccess('Screening updated successfully');
            } else {
                await ScreeningsService.createScreening(apiData as AdminScreeningDTO);
                setSuccess('Screening created successfully');
            }

            setSubmitting(false);

            // Navigate back to screenings list after a short delay
            setTimeout(() => {
                navigate('/admin/screenings');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error saving screening data');
            setSubmitting(false);
        }
    };

    // Format date for datetime-local input
    const formatDateForInput = (date: Date | string | undefined): string => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;

        // Convert to local ISO string and remove the seconds and timezone part
        const localISOString = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
        return localISOString.slice(0, 16);
    };

    return (
        <AdminLayout title={isEditMode ? 'Edit Screening' : 'Add Screening'}>
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin/screenings')}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Screenings
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                    <Calendar size={24} className="text-indigo-600 mr-2" />
                    <h1 className="text-2xl font-semibold text-gray-800">
                        {isEditMode ? 'Edit Screening' : 'Add New Screening'}
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                        <AlertCircle size={18} className="mr-2" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-3 text-gray-600">Loading screening data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Movie Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <Film size={16} className="mr-1" />
                                    Movie <span className="text-red-500 ml-1">*</span>
                                </label>
                                <select
                                    name="movieId"
                                    value={formData.movieId || ''}
                                    onChange={handleSelectChange}
                                    onBlur={handleBlur}
                                    className={`block w-full p-2 border ${touched.movieId && !formData.movieId
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    required
                                >
                                    <option value="">Select a Movie</option>
                                    {movies.map(movie => (
                                        <option key={movie.id} value={movie.id}>
                                            {movie.title} ({movie.durationMinutes} min)
                                        </option>
                                    ))}
                                </select>
                                {touched.movieId && !formData.movieId && (
                                    <p className="mt-1 text-sm text-red-600">Please select a movie</p>
                                )}

                                {selectedMovie && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p>Duration: {selectedMovie.durationMinutes} minutes</p>
                                        <p>Release Date: {new Date(selectedMovie.releaseDate).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Cinema Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <MapPin size={16} className="mr-1" />
                                    Cinema <span className="text-red-500 ml-1">*</span>
                                </label>
                                <select
                                    name="cinemaId"
                                    value={selectedCinema || ''}
                                    onChange={handleSelectChange}
                                    onBlur={handleBlur}
                                    className={`block w-full p-2 border ${touched.cinemaId && !selectedCinema
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    required
                                >
                                    <option value="">Select a Cinema</option>
                                    {cinemas.map(cinema => (
                                        <option key={cinema.id} value={cinema.id}>
                                            {cinema.name}
                                        </option>
                                    ))}
                                </select>
                                {touched.cinemaId && !selectedCinema && (
                                    <p className="mt-1 text-sm text-red-600">Please select a cinema</p>
                                )}
                            </div>

                            {/* Cinema Hall Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <MapPin size={16} className="mr-1" />
                                    Cinema Hall <span className="text-red-500 ml-1">*</span>
                                </label>
                                <select
                                    name="cinemaHallId"
                                    value={formData.cinemaHallId || ''}
                                    onChange={handleSelectChange}
                                    onBlur={handleBlur}
                                    className={`block w-full p-2 border ${touched.cinemaHallId && !formData.cinemaHallId
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    disabled={!selectedCinema}
                                    required
                                >
                                    <option value="">Select a Cinema Hall</option>
                                    {filteredHalls.map(hall => (
                                        <option key={hall.id} value={hall.id}>
                                            {hall.name}
                                        </option>
                                    ))}
                                </select>
                                {touched.cinemaHallId && !formData.cinemaHallId && (
                                    <p className="mt-1 text-sm text-red-600">Please select a cinema hall</p>
                                )}
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <Clock size={16} className="mr-1" />
                                    Start Time <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formatDateForInput(formData.startTime)}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    min={currentDateTime}
                                    className={`block w-full p-2 border ${touched.startTime && !formData.startTime
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    required
                                />
                                {touched.startTime && !formData.startTime && (
                                    <p className="mt-1 text-sm text-red-600">Please select a start time</p>
                                )}

                                {/* Show end time if movie is selected */}
                                {selectedMovie && formData.startTime && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p>End Time: {
                                            new Date(new Date(formData.startTime).getTime() + selectedMovie.durationMinutes * 60000)
                                                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        }</p>
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <DollarSign size={16} className="mr-1" />
                                    Price (VND) <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || ''}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    min="1000"
                                    step="1000"
                                    className={`block w-full p-2 border ${touched.price && (!formData.price || formData.price <= 0)
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    required
                                />
                                {touched.price && (!formData.price || formData.price <= 0) && (
                                    <p className="mt-1 text-sm text-red-600">Please enter a valid price</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/screenings')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                            >
                                {submitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-2" />
                                        {isEditMode ? 'Update Screening' : 'Create Screening'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
};

export default ScreeningFormPage; 