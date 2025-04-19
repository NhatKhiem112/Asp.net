import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CinemasService, { CinemaCreateDTO, CinemaUpdateDTO } from '../../services/cinemas.service';
import AdminLayout from '../../layouts/AdminLayout';
import {
    BuildingOfficeIcon,
    PhoneIcon,
    MapPinIcon,
    InformationCircleIcon,
    PencilIcon,
    PhotoIcon,
    ArrowLeftIcon,
    XMarkIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const CinemaFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState<CinemaCreateDTO | CinemaUpdateDTO>({
        name: '',
        address: '',
        phoneNumber: '',
        description: '',
        imageUrl: '',
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Validation state
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch cinema data if in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const fetchCinema = async () => {
                try {
                    setLoading(true);
                    const data = await CinemasService.getCinema(parseInt(id, 10));
                    setFormData({
                        name: data.name,
                        address: data.address,
                        phoneNumber: data.phoneNumber,
                        description: data.description,
                        imageUrl: data.imageUrl,
                    });
                    setImagePreview(data.imageUrl);
                } catch (err: any) {
                    console.error('Error fetching cinema:', err);
                    setError(err.message || 'Failed to load cinema data');
                } finally {
                    setLoading(false);
                }
            };

            fetchCinema();
        }
    }, [id, isEditMode]);

    // Validation rules
    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'name':
                return !value ? 'Tên rạp là bắt buộc' :
                    value.length < 2 ? 'Tên rạp phải có ít nhất 2 ký tự' : '';
            case 'address':
                return !value ? 'Địa chỉ là bắt buộc' :
                    value.length < 5 ? 'Địa chỉ phải có ít nhất 5 ký tự' : '';
            case 'phoneNumber':
                return !value ? 'Số điện thoại là bắt buộc' :
                    !/^[0-9]{10,11}$/.test(value) ? 'Số điện thoại không hợp lệ (10-11 số)' : '';
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
            address: true,
            phoneNumber: true,
            description: true,
        };
        setTouched(newTouched);

        // Validate each field
        for (const [key, value] of Object.entries(formData)) {
            if (key === 'name' || key === 'address' || key === 'phoneNumber') {
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

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // If field has been touched, validate on change
        if (touched[name]) {
            const error = validateField(name, value);
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

    // Handle image upload button click
    const handleImageButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle image file selection
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setError('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF)');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('Kích thước file không được vượt quá 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload the image
        try {
            setIsUploading(true);
            setUploadProgress(0);
            setError('');

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await CinemasService.uploadImage(file);
            clearInterval(progressInterval);
            setUploadProgress(100);

            // Update form data with the new image URL
            setFormData(prev => ({
                ...prev,
                imageUrl: response.imageUrl
            }));

            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);
        } catch (err: any) {
            setIsUploading(false);
            setUploadProgress(0);
            setError('Lỗi khi tải lên hình ảnh: ' + (err.message || 'Đã xảy ra lỗi'));
            console.error('Error uploading image:', err);
        }
    };

    // Handle image removal
    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            imageUrl: ''
        }));

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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

            if (isEditMode && id) {
                // Update existing cinema
                await CinemasService.updateCinema(parseInt(id, 10), formData);
                setSuccess('Cập nhật rạp chiếu phim thành công!');
            } else {
                // Create new cinema
                await CinemasService.createCinema(formData as CinemaCreateDTO);
                setSuccess('Thêm rạp chiếu phim mới thành công!');
            }

            // Navigate after a short delay
            setTimeout(() => {
                navigate('/admin/cinemas');
            }, 1500);
        } catch (err: any) {
            console.error('Error saving cinema:', err);
            setError(err.response?.data?.message || 'Lỗi khi lưu thông tin rạp chiếu phim');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout title={isEditMode ? 'Chỉnh sửa rạp chiếu phim' : 'Thêm rạp chiếu phim mới'}>
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin/cinemas')}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Quay lại danh sách rạp
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                    <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 mr-2" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Chỉnh sửa rạp chiếu phim' : 'Thêm rạp chiếu phim mới'}
                    </h1>
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
                            {/* Left column: Cinema details */}
                            <div className="space-y-6">
                                {/* Cinema Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                        Tên rạp <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`mt-1 block w-full p-2 border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="Nhập tên rạp chiếu phim"
                                    />
                                    {validationErrors.name && touched.name && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 flex items-center">
                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                        Địa chỉ <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`mt-1 block w-full p-2 border ${validationErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="Nhập địa chỉ rạp chiếu phim"
                                    />
                                    {validationErrors.address && touched.address && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 flex items-center">
                                        <PhoneIcon className="h-4 w-4 mr-1" />
                                        Số điện thoại <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`mt-1 block w-full p-2 border ${validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="Nhập số điện thoại rạp"
                                    />
                                    {validationErrors.phoneNumber && touched.phoneNumber && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
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
                                        placeholder="Nhập mô tả về rạp chiếu phim (không bắt buộc)"
                                    />
                                </div>
                            </div>

                            {/* Right column: Image upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <PhotoIcon className="h-4 w-4 mr-1" />
                                    Hình ảnh rạp chiếu
                                </label>

                                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Cinema preview"
                                                className="w-full h-64 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                                                title="Xóa hình ảnh"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="text-sm text-gray-500">
                                                PNG, JPG, GIF tối đa 5MB
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleImageButtonClick}
                                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Chọn hình ảnh
                                            </button>
                                        </div>
                                    )}

                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/gif"
                                        onChange={handleImageChange}
                                    />

                                    {/* Upload progress */}
                                    {isUploading && (
                                        <div className="w-full mt-2">
                                            <div className="bg-gray-200 rounded-full h-2.5 mt-2">
                                                <div
                                                    className="bg-indigo-600 h-2.5 rounded-full"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 text-center mt-1">
                                                Đang tải lên... {uploadProgress}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form actions */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/cinemas')}
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
                                        {isEditMode ? 'Cập nhật rạp chiếu' : 'Thêm rạp chiếu'}
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

export default CinemaFormPage; 