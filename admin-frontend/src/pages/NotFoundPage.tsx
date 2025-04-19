import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-red-600">404</h1>
                <h2 className="text-4xl font-bold mt-4">Trang không tìm thấy</h2>
                <p className="mt-3 text-gray-400">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
                <div className="mt-8">
                    <Link
                        to="/admin"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Quay về Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage; 