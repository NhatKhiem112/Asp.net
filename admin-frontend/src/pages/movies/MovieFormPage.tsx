import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import MoviesService, { CreateMovieData, UpdateMovieData } from '../../services/movies.service';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const MovieFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState<CreateMovieData | UpdateMovieData>({
        title: '',
        description: '',
        durationMinutes: 0,
        genre: '',
        releaseDate: new Date().toISOString().split('T')[0], // Today's date as default
        endDate: '',
        posterUrl: '',
        backdropUrl: '',
        trailerUrl: '',
        rating: 0
    });

    // Original data (for comparing changes in edit mode)
    const [originalData, setOriginalData] = useState<Record<string, any>>({});

    // File upload state
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [backdropFile, setBackdropFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState<string>('');
    const [backdropPreview, setBackdropPreview] = useState<string>('');

    // Loading & Error states
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMovie, setLoadingMovie] = useState<boolean>(false);

    // Load movie data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const fetchMovie = async () => {
                try {
                    setLoadingMovie(true);
                    const movieData = await MoviesService.getMovie(parseInt(id as string));

                    // Debug the API response data
                    console.log("API response movie data:", movieData);

                    // Save original data for comparison
                    setOriginalData(movieData);

                    // Format the data for the form
                    const formattedData = {
                        title: movieData.title || '',
                        description: movieData.description || '',
                        durationMinutes: movieData.durationMinutes || 0,
                        genre: movieData.genre || '',
                        releaseDate: movieData.releaseDate ? movieData.releaseDate.substring(0, 10) : new Date().toISOString().substring(0, 10),
                        endDate: movieData.endDate ? movieData.endDate.substring(0, 10) : '',
                        posterUrl: movieData.posterUrl || '',
                        backdropUrl: movieData.backdropUrl || '',
                        trailerUrl: movieData.trailerUrl || '',
                        rating: movieData.rating || 0
                    };

                    console.log("Formatted form data:", formattedData);

                    setFormData(formattedData);

                    if (movieData.posterUrl) {
                        setPosterPreview(movieData.posterUrl);
                    }

                    if (movieData.backdropUrl) {
                        setBackdropPreview(movieData.backdropUrl);
                    }

                    console.log("Loaded movie data:", formattedData);
                } catch (err: any) {
                    console.error('Error fetching movie:', err);
                    setError(err.message || 'Không thể tải thông tin phim');
                } finally {
                    setLoadingMovie(false);
                }
            };
            fetchMovie();
        }
    }, [id, isEditMode]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(`Input changed: ${name} = ${value}`);

        // Specially handle date fields to ensure correct format
        if (name === 'releaseDate' || name === 'endDate') {
            console.log(`Date field ${name} updated to: ${value}`);
        }

        setFormData(prev => ({
            ...prev,
            [name]: name === 'durationMinutes' || name === 'rating' ? Number(value) : value
        }));
    };

    // Handle file uploads
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'backdrop') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            console.log(`File selected for ${type}:`, file.name, file.size);

            if (type === 'poster') {
                setPosterFile(file);
                setPosterPreview(URL.createObjectURL(file));
                console.log("Poster file set:", file.name);
                console.log("Poster preview set:", URL.createObjectURL(file));
            } else {
                setBackdropFile(file);
                setBackdropPreview(URL.createObjectURL(file));
                console.log("Backdrop file set:", file.name);
                console.log("Backdrop preview set:", URL.createObjectURL(file));
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Upload images if provided
            let updatedData = { ...formData };
            console.log("Before upload - formData:", updatedData);
            console.log("Poster file:", posterFile);
            console.log("Backdrop file:", backdropFile);

            // Tải lên poster trước nếu có
            if (posterFile) {
                try {
                    console.log("Uploading poster file...");
                    const posterResponse = await MoviesService.uploadPoster(posterFile);
                    console.log("Poster upload response:", posterResponse);
                    updatedData.posterUrl = posterResponse.imageUrl;
                    console.log("Updated posterUrl:", updatedData.posterUrl);
                } catch (uploadErr) {
                    console.error("Error uploading poster:", uploadErr);
                    setError("Lỗi khi tải lên poster. Vui lòng thử lại.");
                    setLoading(false);
                    return;
                }
            }

            // Tải lên backdrop nếu có
            if (backdropFile) {
                try {
                    console.log("Uploading backdrop file...");
                    const backdropResponse = await MoviesService.uploadPoster(backdropFile);
                    console.log("Backdrop upload response:", backdropResponse);
                    updatedData.backdropUrl = backdropResponse.imageUrl;
                    console.log("Updated backdropUrl:", updatedData.backdropUrl);
                } catch (uploadErr) {
                    console.error("Error uploading backdrop:", uploadErr);
                    setError("Lỗi khi tải lên backdrop. Vui lòng thử lại.");
                    setLoading(false);
                    return;
                }
            }

            console.log("After upload - updatedData:", updatedData);

            // Create or update movie
            if (isEditMode) {
                // For update, only include changed fields
                const changedData: UpdateMovieData = {};

                // Explicitly add EndDate if changed - this ensures it's included when modified
                if (updatedData.endDate) {
                    // Normalize dates to strings for comparison
                    const originalEndDateStr = originalData.endDate ? originalData.endDate.substring(0, 10) : '';
                    const newEndDateStr = updatedData.endDate;

                    console.log("Original endDate (normalized):", originalEndDateStr);
                    console.log("New endDate (normalized):", newEndDateStr);

                    if (originalEndDateStr !== newEndDateStr) {
                        (changedData as any).endDate = updatedData.endDate;
                        console.log("EndDate added to changes:", updatedData.endDate);
                    }
                }

                // Compare with original data and only include changed fields
                Object.keys(updatedData).forEach(key => {
                    const typedKey = key as keyof typeof updatedData;
                    // Skip endDate as we handled it separately above
                    if (typedKey === 'endDate') {
                        return;
                    }

                    // Handle durationMinutes specifically
                    if (typedKey === 'durationMinutes' && originalData['durationMinutes'] !== updatedData[typedKey]) {
                        changedData.durationMinutes = updatedData[typedKey] as number;
                    }
                    // Handle trailerUrl specifically
                    else if (typedKey === 'trailerUrl' && originalData['trailerUrl'] !== updatedData[typedKey]) {
                        (changedData as any)['trailerUrl'] = updatedData[typedKey];
                    }
                    // For other fields, compare directly
                    else if (typedKey !== 'durationMinutes' && originalData[typedKey] !== updatedData[typedKey]) {
                        (changedData as any)[typedKey] = updatedData[typedKey];
                    }
                });

                console.log("Original data:", originalData);
                console.log("Updated data:", updatedData);
                console.log("Sending update with changed data:", changedData);
                await MoviesService.updateMovie(parseInt(id as string), changedData);
                alert('Cập nhật phim thành công!');
            } else {
                // Khi tạo phim mới, đảm bảo tất cả trường được đặt đúng
                const createData: any = {
                    title: updatedData.title,
                    description: updatedData.description,
                    genre: updatedData.genre,
                    releaseDate: updatedData.releaseDate,
                    durationMinutes: updatedData.durationMinutes,
                    rating: updatedData.rating || 0,
                    posterUrl: updatedData.posterUrl || '',
                    backdropUrl: updatedData.backdropUrl || '',
                    trailerUrl: updatedData.trailerUrl || ''
                };

                // Thêm endDate nếu được cung cấp
                if (updatedData.endDate) {
                    createData.endDate = updatedData.endDate;
                }

                console.log("Creating new movie with data:", createData);

                try {
                    await MoviesService.createMovie(createData as CreateMovieData);
                    alert('Thêm phim mới thành công!');
                    // Redirect back to movies list
                    navigate('/admin/movies');
                } catch (createErr: any) {
                    console.error('Error creating movie:', createErr);
                    console.error('Response:', createErr.response?.data);
                    setError(createErr.message || 'Có lỗi xảy ra khi tạo phim mới');
                }
                return; // Ngăn chặn redirect ở bên dưới nếu có lỗi
            }

            // Redirect back to movies list
            navigate('/admin/movies');
        } catch (err: any) {
            console.error('Error saving movie:', err);
            setError(err.message || 'Có lỗi xảy ra khi lưu phim');
        } finally {
            setLoading(false);
        }
    };

    if (loadingMovie) {
        return (
            <AdminLayout title={isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'}>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'}>
            <div className="bg-white p-6 rounded-lg shadow">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/admin/movies')}
                        className="mr-4 text-gray-500 hover:text-red-600"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
                    </h1>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                        <p>{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên phim *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="admin-input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="admin-input min-h-32"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thời lượng (phút) *
                                    </label>
                                    <input
                                        type="number"
                                        name="durationMinutes"
                                        value={formData.durationMinutes}
                                        onChange={handleInputChange}
                                        className="admin-input"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thể loại *
                                    </label>
                                    <input
                                        type="text"
                                        name="genre"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                        className="admin-input"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày phát hành *
                                    </label>
                                    <input
                                        type="date"
                                        name="releaseDate"
                                        value={formData.releaseDate}
                                        onChange={handleInputChange}
                                        className="admin-input"
                                        required
                                    />
                                    {isEditMode && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Current value: {formData.releaseDate || 'None set'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày kết thúc
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="admin-input"
                                    />
                                    {isEditMode && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Current value: {formData.endDate || 'None set'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đánh giá (0-10)
                                    </label>
                                    <input
                                        type="number"
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleInputChange}
                                        className="admin-input"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trailer URL
                                </label>
                                <input
                                    type="url"
                                    name="trailerUrl"
                                    value={formData.trailerUrl}
                                    onChange={handleInputChange}
                                    className="admin-input"
                                    placeholder="https://www.youtube.com/..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ảnh poster
                                </label>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(e, 'poster')}
                                            className="admin-input p-2"
                                            accept="image/*"
                                        />
                                        {posterFile && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Đã chọn: {posterFile.name} ({(posterFile.size / 1024).toFixed(1)} KB)
                                            </p>
                                        )}
                                    </div>
                                    {posterPreview && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={posterPreview}
                                                alt="Poster preview"
                                                className="w-20 h-28 object-cover rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                                {isEditMode && formData.posterUrl && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Poster hiện tại: {formData.posterUrl.split('/').pop()}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ảnh backdrop
                                </label>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(e, 'backdrop')}
                                            className="admin-input p-2"
                                            accept="image/*"
                                        />
                                        {backdropFile && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Đã chọn: {backdropFile.name} ({(backdropFile.size / 1024).toFixed(1)} KB)
                                            </p>
                                        )}
                                    </div>
                                    {backdropPreview && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={backdropPreview}
                                                alt="Backdrop preview"
                                                className="w-28 h-16 object-cover rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                                {isEditMode && formData.backdropUrl && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Backdrop hiện tại: {formData.backdropUrl.split('/').pop()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="mt-8 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/movies')}
                            className="mr-4 px-4 py-2 border border-gray-300 rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                            disabled={loading}
                            onClick={() => console.log("Submit button clicked, form data:", formData, "poster file:", posterFile, "backdrop file:", backdropFile)}
                        >
                            {loading && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isEditMode ? 'Cập nhật' : 'Thêm phim'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default MovieFormPage; 