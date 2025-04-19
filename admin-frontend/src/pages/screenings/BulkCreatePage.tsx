import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Film, MapPin, Clock, DollarSign, Save, ArrowLeft, AlertCircle, Plus, Trash2 } from 'react-feather';
import ScreeningsService, { BulkScreeningDTO } from '../../services/screenings.service';
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

interface DayCheckbox {
    value: number;
    label: string;
    checked: boolean;
}

const BulkCreatePage: React.FC = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState<Omit<BulkScreeningDTO, 'daysOfWeek' | 'showTimes'>>({
        movieId: 0,
        cinemaHallId: 0,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to a week ahead
        price: 0,
    });

    // Selected movie and cinema state for UI
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [selectedCinema, setSelectedCinema] = useState<number | null>(null);

    // Days of week checkboxes
    const [daysOfWeek, setDaysOfWeek] = useState<DayCheckbox[]>([
        { value: 0, label: 'Sunday', checked: true },
        { value: 1, label: 'Monday', checked: true },
        { value: 2, label: 'Tuesday', checked: true },
        { value: 3, label: 'Wednesday', checked: true },
        { value: 4, label: 'Thursday', checked: true },
        { value: 5, label: 'Friday', checked: true },
        { value: 6, label: 'Saturday', checked: true },
    ]);

    // Show times
    const [showTimes, setShowTimes] = useState<string[]>(['09:00', '13:00', '18:00']);
    const [newShowTime, setNewShowTime] = useState<string>('');

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
    const [previewCount, setPreviewCount] = useState<number>(0);
    const [showPreview, setShowPreview] = useState(false);
    const [previewDates, setPreviewDates] = useState<string[]>([]);

    // Time zone handling
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDateString = today.toISOString().split('T')[0];

    useEffect(() => {
        fetchDropdownData();
    }, []);

    // When cinema selection changes, filter the cinema halls
    useEffect(() => {
        if (selectedCinema) {
            setFilteredHalls(cinemaHalls.filter(hall => hall.cinemaId === selectedCinema));

            // Reset cinema hall selection if it doesn't belong to selected cinema
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

    // Calculate preview when relevant fields change
    useEffect(() => {
        calculateScreeningPreview();
    }, [formData.startDate, formData.endDate, daysOfWeek, showTimes]);

    const fetchDropdownData = async () => {
        try {
            setLoading(true);
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
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dropdown data:', err);
            setError('Failed to load necessary data. Please try again.');
            setLoading(false);
        }
    };

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
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'number' ? parseFloat(value) : value,
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update date in the form data
        setFormData({
            ...formData,
            [name]: new Date(value),
        });
    };

    const handleDayCheckboxChange = (index: number) => {
        const updatedDays = [...daysOfWeek];
        updatedDays[index].checked = !updatedDays[index].checked;
        setDaysOfWeek(updatedDays);
    };

    const handleAddShowTime = () => {
        if (!newShowTime) return;

        // Check if the time is already in the list
        if (showTimes.includes(newShowTime)) {
            setError('This show time is already added');
            return;
        }

        setShowTimes([...showTimes, newShowTime].sort());
        setNewShowTime('');
    };

    const handleRemoveShowTime = (timeToRemove: string) => {
        setShowTimes(showTimes.filter(time => time !== timeToRemove));
    };

    const calculateScreeningPreview = () => {
        if (!formData.startDate || !formData.endDate) {
            setPreviewCount(0);
            setPreviewDates([]);
            return;
        }

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const selectedDays = daysOfWeek.filter(day => day.checked).map(day => day.value);

        if (selectedDays.length === 0 || showTimes.length === 0) {
            setPreviewCount(0);
            setPreviewDates([]);
            return;
        }

        const dates: string[] = [];
        let screeningCount = 0;

        // Loop through each day in the date range
        for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
            const dayOfWeek = day.getDay();

            // If this day of week is selected
            if (selectedDays.includes(dayOfWeek)) {
                const dateStr = day.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                if (!dates.includes(dateStr)) {
                    dates.push(dateStr);
                }

                // Each selected day has multiple showtimes
                screeningCount += showTimes.length;
            }
        }

        setPreviewCount(screeningCount);
        setPreviewDates(dates);
    };

    const validate = (): boolean => {
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

        // Validate date range
        if (!formData.startDate || !formData.endDate) {
            setError('Please select a valid date range');
            return false;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('Start date must be before or equal to end date');
            return false;
        }

        // Validate days of week
        const selectedDays = daysOfWeek.filter(day => day.checked);
        if (selectedDays.length === 0) {
            setError('Please select at least one day of the week');
            return false;
        }

        // Validate show times
        if (showTimes.length === 0) {
            setError('Please add at least one show time');
            return false;
        }

        // Validate price
        if (!formData.price || formData.price <= 0) {
            setError('Please enter a valid price');
            return false;
        }

        // Validate start date is not before movie release date
        if (selectedMovie && selectedMovie.releaseDate) {
            const releaseDate = new Date(selectedMovie.releaseDate);
            releaseDate.setHours(0, 0, 0, 0);

            const startDate = new Date(formData.startDate);
            startDate.setHours(0, 0, 0, 0);

            if (startDate < releaseDate) {
                setError(`Start date cannot be earlier than the movie's release date (${releaseDate.toLocaleDateString()})`);
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

            // Prepare data for API
            const selectedDays = daysOfWeek.filter(day => day.checked).map(day => day.value);

            // Convert show times from strings to Date objects
            const timeObjects = showTimes.map(timeStr => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                const timeObj = new Date();
                timeObj.setHours(hours, minutes, 0, 0);
                return timeObj;
            });

            const bulkData: BulkScreeningDTO = {
                ...formData,
                daysOfWeek: selectedDays,
                showTimes: timeObjects,
            };

            const result = await ScreeningsService.bulkCreateScreenings(bulkData);
            setSuccess(`Successfully created ${result.ScreeningCount} screenings`);

            setSubmitting(false);

            // Navigate back to screenings list after a short delay
            setTimeout(() => {
                navigate('/admin/screenings');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error creating screenings');
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout title="Bulk Create Screenings">
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
                        Bulk Create Screenings
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
                        <p className="mt-3 text-gray-600">Loading data...</p>
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
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select a Movie</option>
                                    {movies.map(movie => (
                                        <option key={movie.id} value={movie.id}>
                                            {movie.title} ({movie.durationMinutes} min)
                                        </option>
                                    ))}
                                </select>

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
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select a Cinema</option>
                                    {cinemas.map(cinema => (
                                        <option key={cinema.id} value={cinema.id}>
                                            {cinema.name}
                                        </option>
                                    ))}
                                </select>
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
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                    min="1000"
                                    step="1000"
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <hr className="my-6 border-gray-200" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date Range */}
                            <div>
                                <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                                    <Calendar size={16} className="mr-1" />
                                    Date Range
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                                            onChange={handleDateChange}
                                            min={minDateString}
                                            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                                            onChange={handleDateChange}
                                            min={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : minDateString}
                                            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Days of Week */}
                            <div>
                                <h3 className="text-md font-medium text-gray-800 mb-3">Days of Week</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {daysOfWeek.map((day, index) => (
                                        <label key={day.value} className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={day.checked}
                                                onChange={() => handleDayCheckboxChange(index)}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Show Times */}
                        <div>
                            <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                                <Clock size={16} className="mr-1" />
                                Show Times
                            </h3>
                            <div className="flex items-center space-x-2 mb-3">
                                <input
                                    type="time"
                                    value={newShowTime}
                                    onChange={(e) => setNewShowTime(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddShowTime}
                                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {showTimes.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {showTimes.map(time => (
                                        <div key={time} className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
                                            <span className="text-sm text-gray-800 mr-2">{time}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveShowTime(time)}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-4">No show times added yet</p>
                            )}
                        </div>

                        {/* Preview section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-md font-medium text-gray-800">Preview</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    {showPreview ? 'Hide Details' : 'Show Details'}
                                </button>
                            </div>

                            <p className="text-sm text-gray-700 mb-2">
                                This will create <span className="font-semibold">{previewCount}</span> screenings
                                {selectedMovie && ` for "${selectedMovie.title}"`}
                                {formData.price > 0 && ` at ${formData.price.toLocaleString('vi-VN')} VND per ticket`}.
                            </p>

                            {showPreview && previewDates.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Screening Dates:</h4>
                                    <div className="bg-white p-2 rounded border border-gray-200 max-h-32 overflow-y-auto">
                                        <ul className="text-xs text-gray-600">
                                            {previewDates.map((date, index) => (
                                                <li key={index} className="mb-1">
                                                    {date}: {showTimes.length} screenings ({showTimes.join(', ')})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {previewCount === 0 && (
                                <p className="text-sm text-yellow-600">
                                    <AlertCircle size={16} className="inline mr-1" />
                                    No screenings will be created with the current selection. Please check your inputs.
                                </p>
                            )}
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
                                disabled={submitting || previewCount === 0}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${submitting || previewCount === 0
                                        ? 'bg-indigo-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    } flex items-center`}
                            >
                                {submitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Calendar size={16} className="mr-2" />
                                        Create {previewCount} Screenings
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

export default BulkCreatePage; 