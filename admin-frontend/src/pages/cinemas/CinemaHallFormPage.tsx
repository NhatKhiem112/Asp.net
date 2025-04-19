import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CinemasService, { CinemaHall } from '../../services/cinemas.service';
import CinemaHallsService from '../../services/cinemaHalls.service';
import AdminLayout from '../../layouts/AdminLayout';
import {
    BuildingOfficeIcon,
    ChevronDoubleRightIcon,
    ChevronRightIcon,
    ExclamationCircleIcon,
    ArrowLeftIcon,
    TableCellsIcon,
    InformationCircleIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';

const CinemaHallFormPage: React.FC = () => {
    const { cinemaId, hallId } = useParams<{ cinemaId: string; hallId: string }>();
    const isEditMode = !!hallId;
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        rowCount: 10,
        seatCountPerRow: 12,
        seatLayout: ''
    });

    // Cinema info
    const [cinemaName, setCinemaName] = useState('');

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Seating layout preview
    const [previewLayout, setPreviewLayout] = useState<string[][]>([]);

    // Validation state
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Seating layout dimensions tracker
    const [layoutDimensions, setLayoutDimensions] = useState({
        prevRows: 0,
        prevSeatsPerRow: 0
    });

    // Toggle for displaying seat IDs
    const [showSeatIds, setShowSeatIds] = useState(false);

    // Fetch cinema hall data if in edit mode
    useEffect(() => {
        if (!cinemaId) return;

        const fetchCinemaInfo = async () => {
            try {
                // Fetch cinema name
                const cinema = await CinemasService.getCinema(parseInt(cinemaId, 10));
                setCinemaName(cinema.name);

                if (isEditMode && hallId) {
                    setLoading(true);
                    try {
                        // Fetch hall data directly instead of searching it in cinema
                        const hall = await CinemaHallsService.getHall(parseInt(hallId, 10));

                        if (hall) {
                            // Get seat information to calculate row count and seats per row
                            try {
                                const seatInfo = await CinemaHallsService.getSeats(parseInt(hallId, 10));
                                console.log('Seat info:', seatInfo);

                                // Calculate row count and seat count per row from layout info
                                const rowCount = seatInfo.layoutInfo?.rowsCount || 10;
                                const seatCountPerRow = seatInfo.layoutInfo?.columnsCount || 12;

                                setFormData({
                                    name: hall.name,
                                    description: hall.description || '',
                                    rowCount: rowCount,
                                    seatCountPerRow: seatCountPerRow,
                                    seatLayout: '' // Will be generated from row/seat counts
                                });

                                // Generate preview layout based on seat map information
                                generatePreviewLayout(rowCount, seatCountPerRow);
                            } catch (seatError) {
                                console.error('Error fetching seat data:', seatError);

                                // Fallback to basic data
                                setFormData({
                                    name: hall.name,
                                    description: hall.description || '',
                                    rowCount: hall.rowCount || 10,
                                    seatCountPerRow: hall.seatsPerRow || 12,
                                    seatLayout: hall.seatLayout || ''
                                });

                                generatePreviewLayout(hall.rowCount || 10, hall.seatsPerRow || 12);
                            }
                        } else {
                            setError('Cinema hall not found');
                        }
                    } catch (hallError: any) {
                        console.error('Error fetching hall data:', hallError);
                        setError(hallError.message || 'Failed to load hall data');
                    } finally {
                        setLoading(false);
                    }
                } else {
                    // For new halls, just generate a default preview
                    generatePreviewLayout(formData.rowCount, formData.seatCountPerRow);
                }
            } catch (err: any) {
                console.error('Error fetching cinema info:', err);
                setError(err.message || 'Failed to load cinema data');
                setLoading(false);
            }
        };

        fetchCinemaInfo();
    }, [cinemaId, hallId, isEditMode]);

    // Generate preview layout when row/seat counts change
    useEffect(() => {
        // Only regenerate layout if dimensions changed
        if (formData.rowCount !== layoutDimensions.prevRows ||
            formData.seatCountPerRow !== layoutDimensions.prevSeatsPerRow) {

            console.log('Row or seat count changed, regenerating layout');
            generatePreviewLayout(formData.rowCount, formData.seatCountPerRow, '');

            // Update tracked dimensions
            setLayoutDimensions({
                prevRows: formData.rowCount,
                prevSeatsPerRow: formData.seatCountPerRow
            });
        }
    }, [formData.rowCount, formData.seatCountPerRow, layoutDimensions]);

    // Validation rules
    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'name':
                return !value ? 'Tên phòng chiếu là bắt buộc' :
                    value.length < 2 ? 'Tên phòng chiếu phải có ít nhất 2 ký tự' : '';
            case 'rowCount':
                return !value ? 'Số hàng ghế là bắt buộc' :
                    value < 1 ? 'Số hàng ghế phải lớn hơn 0' :
                        value > 30 ? 'Số hàng ghế không vượt quá 30' : '';
            case 'seatCountPerRow':
                return !value ? 'Số ghế mỗi hàng là bắt buộc' :
                    value < 1 ? 'Số ghế mỗi hàng phải lớn hơn 0' :
                        value > 50 ? 'Số ghế mỗi hàng không vượt quá 50' : '';
            default:
                return '';
        }
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        let isValid = true;

        // Mark all fields as touched
        const newTouched: Record<string, boolean> = {
            name: true,
            rowCount: true,
            seatCountPerRow: true,
            description: true,
        };
        setTouched(newTouched);

        // Validate each field
        for (const [key, value] of Object.entries(formData)) {
            if (key === 'name' || key === 'rowCount' || key === 'seatCountPerRow') {
                const error = validateField(key, value);
                if (error) {
                    errors[key] = error;
                    isValid = false;
                }
            }
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        let processedValue: string | number = value;
        if (name === 'rowCount' || name === 'seatCountPerRow') {
            processedValue = Math.max(1, parseInt(value) || 1);
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // If field has been touched, validate on change
        if (touched[name]) {
            const error = validateField(name, processedValue);
            setValidationErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    // Handle field blur for validation
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        const error = validateField(name, value);
        setValidationErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Generate seating layout matrix
    const generatePreviewLayout = (rows: number = 10, seatsPerRow: number = 12, currentLayout: string = '') => {
        let layout: string[][] = [];

        if (currentLayout) {
            try {
                // Parse the existing layout string
                const parsedLayout = JSON.parse(currentLayout);

                // Verify if the parsed layout has the correct dimensions
                if (Array.isArray(parsedLayout) &&
                    parsedLayout.length === rows &&
                    parsedLayout.every((row: any) => Array.isArray(row) && row.length === seatsPerRow)) {
                    layout = parsedLayout;
                } else {
                    // If dimensions don't match, generate new layout
                    console.log('Dimensions changed, generating new layout');
                    layout = generateNewLayout(rows, seatsPerRow);
                }
            } catch (e) {
                console.error('Error parsing seat layout:', e);
                layout = generateNewLayout(rows, seatsPerRow);
            }
        } else {
            layout = generateNewLayout(rows, seatsPerRow);
        }

        setPreviewLayout(layout);

        // Also update the form data with the stringified layout
        setFormData(prev => ({
            ...prev,
            seatLayout: JSON.stringify(layout)
        }));
    };

    // Generate a new layout with default seat values
    const generateNewLayout = (rows: number, seatsPerRow: number): string[][] => {
        // Create a 2D array filled with 'A' for available seats
        return Array(rows).fill(0).map(() => Array(seatsPerRow).fill('A'));
    };

    // Toggle seat status in the layout
    const toggleSeatStatus = (rowIndex: number, seatIndex: number) => {
        const newLayout = [...previewLayout];

        // Toggle between 'A' (available), 'U' (unavailable), and 'S' (special)
        switch (newLayout[rowIndex][seatIndex]) {
            case 'A':
                newLayout[rowIndex][seatIndex] = 'U';
                break;
            case 'U':
                newLayout[rowIndex][seatIndex] = 'S';
                break;
            case 'S':
                newLayout[rowIndex][seatIndex] = 'A';
                break;
            default:
                newLayout[rowIndex][seatIndex] = 'A';
        }

        setPreviewLayout(newLayout);

        // Update form data
        setFormData(prev => ({
            ...prev,
            seatLayout: JSON.stringify(newLayout)
        }));
    };

    // Render seat with appropriate style based on its status
    const renderSeat = (status: string, rowIndex: number, seatIndex: number) => {
        let bgColor = 'bg-green-100 hover:bg-green-200';
        let textColor = 'text-green-800';

        if (status === 'U') {
            bgColor = 'bg-gray-100 hover:bg-gray-200';
            textColor = 'text-gray-800';
        } else if (status === 'S') {
            bgColor = 'bg-purple-100 hover:bg-purple-200';
            textColor = 'text-purple-800';
        }

        // Generate seat ID (e.g., A1, B2, etc.)
        const rowLetter = String.fromCharCode(65 + rowIndex);
        const seatNumber = seatIndex + 1;
        const seatId = `${rowLetter}${seatNumber}`;

        return (
            <button
                key={`seat-${rowIndex}-${seatIndex}`}
                type="button"
                className={`${bgColor} ${textColor} w-8 h-8 text-xs font-medium rounded-md flex items-center justify-center m-1 border border-gray-300`}
                onClick={() => toggleSeatStatus(rowIndex, seatIndex)}
                title={`${seatId}: ${status === 'A' ? 'Ghế trống' : status === 'U' ? 'Ghế không khả dụng' : 'Ghế đặc biệt'}`}
            >
                {seatId}
            </button>
        );
    };

    // Reset layout to all available seats
    const resetLayout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đặt lại tất cả các ghế về trạng thái ban đầu?')) {
            generatePreviewLayout(formData.rowCount, formData.seatCountPerRow);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // Calculate the total capacity
            const totalCapacity = formData.rowCount * formData.seatCountPerRow;
            console.log('[handleSubmit] Calculated total capacity:', totalCapacity);

            if (isEditMode && hallId && cinemaId) {
                // Update existing hall
                console.log('[handleSubmit] Updating existing hall:', hallId);
                console.log('[handleSubmit] Update parameters:', {
                    cinemaId,
                    hallId,
                    formData,
                    totalCapacity,
                    dimensions: {
                        prevRows: layoutDimensions.prevRows,
                        prevSeatsPerRow: layoutDimensions.prevSeatsPerRow,
                        currentRows: formData.rowCount,
                        currentSeatsPerRow: formData.seatCountPerRow
                    }
                });

                try {
                    console.log('[handleSubmit] Attempting to update via CinemasService');
                    const updateData = {
                        name: formData.name,
                        description: formData.description,
                        hallType: 'Standard',
                        capacity: totalCapacity,
                        regenerateSeats: true
                    };
                    console.log('[handleSubmit] Update data:', updateData);

                    const result = await CinemasService.updateCinemaHall(
                        parseInt(cinemaId, 10),
                        parseInt(hallId, 10),
                        updateData
                    );

                    console.log('[handleSubmit] CinemasService update response:', result);

                    // Check if row count or seats per row has changed
                    if (layoutDimensions.prevRows !== formData.rowCount ||
                        layoutDimensions.prevSeatsPerRow !== formData.seatCountPerRow) {
                        // Clear existing seats and regenerate
                        console.log('Dimensions changed, regenerating seat layout');
                        try {
                            // First clear existing seats
                            await CinemaHallsService.clearSeats(parseInt(hallId, 10));

                            // Then generate new seats
                            await CinemaHallsService.createSeatLayout(
                                parseInt(hallId, 10),
                                formData.rowCount,
                                formData.seatCountPerRow
                            );
                            console.log('Seat layout regenerated successfully');
                        } catch (seatError) {
                            console.error('Error regenerating seats:', seatError);
                            // Continue with success message even if seat regeneration fails
                        }
                    }

                    setSuccess('Cập nhật phòng chiếu thành công!');
                } catch (updateError: any) {
                    console.error('Error updating hall with CinemasService:', updateError);

                    // Fall back to CinemaHallsService if available
                    try {
                        console.log('[handleSubmit] Attempting fallback update via CinemaHallsService');
                        const fallbackUpdateData = {
                            name: formData.name,
                            cinemaId: parseInt(cinemaId, 10),
                            capacity: totalCapacity, // Ensure capacity is updated based on rowCount * seatCountPerRow
                            hallType: 'Standard',
                            regenerateSeats: true
                        };
                        console.log('[handleSubmit] Fallback update data:', fallbackUpdateData);

                        const fallbackResult = await CinemaHallsService.updateHall(
                            parseInt(hallId, 10),
                            fallbackUpdateData
                        );

                        console.log('[handleSubmit] CinemaHallsService update response:', fallbackResult);

                        // Check if row count or seats per row has changed
                        if (layoutDimensions.prevRows !== formData.rowCount ||
                            layoutDimensions.prevSeatsPerRow !== formData.seatCountPerRow) {
                            // Clear existing seats and regenerate
                            console.log('Dimensions changed, regenerating seat layout (fallback)');
                            try {
                                // First clear existing seats
                                await CinemaHallsService.clearSeats(parseInt(hallId, 10));

                                // Then generate new seats
                                await CinemaHallsService.createSeatLayout(
                                    parseInt(hallId, 10),
                                    formData.rowCount,
                                    formData.seatCountPerRow
                                );
                                console.log('Seat layout regenerated successfully');
                            } catch (seatError) {
                                console.error('Error regenerating seats:', seatError);
                                // Continue with success message even if seat regeneration fails
                            }
                        }

                        setSuccess('Cập nhật phòng chiếu thành công (qua CinemaHallsService)!');
                    } catch (fallbackError) {
                        console.error('Fallback update also failed:', fallbackError);
                        throw updateError; // Re-throw original error
                    }
                }
            } else if (cinemaId) {
                // Create new hall
                console.log('Creating new hall for cinema:', cinemaId);
                try {
                    // Try with CinemaHallsService first since it matches controller better
                    const result = await CinemaHallsService.createHall({
                        name: formData.name,
                        cinemaId: parseInt(cinemaId, 10),
                        capacity: totalCapacity,
                        hallType: 'Standard'
                    });

                    console.log('Hall creation successful:', result);

                    // If successful and we have result ID, create the seat layout
                    if (result && result.cinemaHallId) {
                        console.log('Creating seat layout for hall ID:', result.cinemaHallId);
                        await CinemaHallsService.createSeatLayout(
                            result.cinemaHallId,
                            formData.rowCount,
                            formData.seatCountPerRow
                        );
                    }

                    setSuccess('Thêm phòng chiếu mới thành công!');
                } catch (createError: any) {
                    console.error('Error creating hall with CinemaHallsService:', createError);

                    // Fall back to CinemasService
                    try {
                        console.log('Attempting to create hall with CinemasService');
                        const result = await CinemasService.createCinemaHall(
                            parseInt(cinemaId, 10),
                            {
                                name: formData.name,
                                description: formData.description,
                                rowCount: formData.rowCount,
                                seatsPerRow: formData.seatCountPerRow,
                                cinemaId: parseInt(cinemaId, 10),
                                hallType: 'Standard'
                            }
                        );

                        console.log('Hall creation with CinemasService result:', result);
                        setSuccess('Thêm phòng chiếu mới thành công (qua CinemasService)!');
                    } catch (fallbackError) {
                        console.error('Fallback creation also failed:', fallbackError);
                        throw createError; // Re-throw original error
                    }
                }
            }

            // Navigate after a short delay
            setTimeout(() => {
                navigate(`/admin/cinemas/${cinemaId}`);
            }, 1500);
        } catch (err: any) {
            console.error('Error saving cinema hall:', err);
            setError(err.response?.data?.message || 'Lỗi khi lưu thông tin phòng chiếu');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout title={isEditMode ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu mới'}>
            <div className="mb-4">
                <button
                    onClick={() => navigate(`/admin/cinemas/${cinemaId}`)}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Quay lại rạp {cinemaName}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                    <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 mr-2" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu mới'}
                        </h1>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                            <span>Rạp: {cinemaName}</span>
                            <ChevronRightIcon className="h-4 w-4 mx-1" />
                            <span>{isEditMode ? formData.name : 'Phòng mới'}</span>
                        </div>
                    </div>
                </div>

                {/* Error and success messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <div className="flex">
                            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left column: Basic info */}
                            <div className="space-y-6">
                                {/* Hall Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                                        <TableCellsIcon className="h-4 w-4 mr-1" />
                                        Tên phòng <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`mt-1 block w-full p-2 border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="Nhập tên phòng chiếu (VD: Phòng 1, Phòng VIP)"
                                    />
                                    {validationErrors.name && touched.name && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                                        <InformationCircleIcon className="h-4 w-4 mr-1" />
                                        Mô tả
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Nhập mô tả về phòng chiếu (không bắt buộc)"
                                    />
                                </div>

                                {/* Row Count */}
                                <div>
                                    <label htmlFor="rowCount" className="block text-sm font-medium text-gray-700 flex items-center">
                                        Số hàng ghế <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="rowCount"
                                        name="rowCount"
                                        min="1"
                                        max="30"
                                        value={formData.rowCount}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`mt-1 block w-full p-2 border ${validationErrors.rowCount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    />
                                    {validationErrors.rowCount && touched.rowCount && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.rowCount}</p>
                                    )}
                                </div>

                                {/* Seat Count Per Row */}
                                <div>
                                    <label htmlFor="seatCountPerRow" className="block text-sm font-medium text-gray-700 flex items-center">
                                        Số ghế mỗi hàng <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="seatCountPerRow"
                                        name="seatCountPerRow"
                                        min="1"
                                        max="50"
                                        value={formData.seatCountPerRow}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`mt-1 block w-full p-2 border ${validationErrors.seatCountPerRow ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    />
                                    {validationErrors.seatCountPerRow && touched.seatCountPerRow && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.seatCountPerRow}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right column: Seating layout */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-md font-medium text-gray-700">Sơ đồ chỗ ngồi</h3>
                                        <p className="text-sm text-gray-500">Nhấn vào ghế để thay đổi trạng thái</p>
                                    </div>
                                    <div className="flex items-center space-x-4">                                        <button
                                            type="button"
                                            onClick={resetLayout}
                                            className="text-xs text-indigo-600 hover:text-indigo-900 flex items-center"
                                        >
                                            Đặt lại tất cả ghế
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-96">
                                    {/* Seat legend */}
                                    <div className="flex space-x-4 mb-4 justify-center">
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-green-100 border border-gray-300 rounded-sm mr-1"></div>
                                            <span className="text-xs">Ghế trống (A)</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-sm mr-1"></div>
                                            <span className="text-xs">Ghế không khả dụng (X)</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-purple-100 border border-gray-300 rounded-sm mr-1"></div>
                                            <span className="text-xs">Ghế đặc biệt (S)</span>
                                        </div>
                                    </div>

                                    {/* Screen */}
                                    <div className="relative mb-6">
                                        <div className="absolute w-full h-px bg-gray-300 top-1/2 left-0"></div>
                                        <div className="relative flex justify-center">
                                            <div className="bg-gray-200 text-gray-700 text-xs py-1 px-4 rounded-sm inline-block z-10">
                                                MÀN HÌNH
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seats Container - Add horizontal scrolling capability */}
                                    <div className="overflow-x-auto pb-2">
                                        <div className="flex flex-col items-center" style={{ minWidth: `${Math.max(formData.seatCountPerRow * 34, 400)}px` }}>
                                            {/* Column numbers at the top */}
                                            <div className="flex items-center mb-2">
                                                <span className="text-xs text-gray-500 w-6"></span>
                                                <div className="flex flex-nowrap" style={{ minWidth: `${formData.seatCountPerRow * 34}px` }}>
                                                    {Array.from({ length: formData.seatCountPerRow }, (_, i) => (
                                                        <div key={`col-num-${i}`} className="w-8 text-center mx-1">
                                                            <span className="text-xs text-gray-500">{i + 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500 w-6"></span>
                                            </div>

                                            {previewLayout.map((row, rowIndex) => (
                                                <div key={`row-${rowIndex}`} className="flex items-center mb-1">
                                                    <span className="text-xs text-gray-500 w-6 text-right pr-2">
                                                        {String.fromCharCode(65 + rowIndex)}
                                                    </span>
                                                    <div className="flex flex-nowrap" style={{ minWidth: `${row.length * 34}px` }}>
                                                        {row.map((seat, seatIndex) => (
                                                            renderSeat(seat, rowIndex, seatIndex)
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-6 text-left pl-2">
                                                        {String.fromCharCode(65 + rowIndex)}
                                                    </span>
                                                </div>
                                            ))}

                                            {/* Column numbers at the bottom */}
                                            <div className="flex items-center mt-2">
                                                <span className="text-xs text-gray-500 w-6"></span>
                                                <div className="flex flex-nowrap" style={{ minWidth: `${formData.seatCountPerRow * 34}px` }}>
                                                    {Array.from({ length: formData.seatCountPerRow }, (_, i) => (
                                                        <div key={`col-num-bottom-${i}`} className="w-8 text-center mx-1">
                                                            <span className="text-xs text-gray-500">{i + 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500 w-6"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form actions */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/cinemas/${cinemaId}`)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                            >
                                {submitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        {isEditMode ? 'Cập nhật phòng chiếu' : 'Thêm phòng chiếu'}
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

export default CinemaHallFormPage; 