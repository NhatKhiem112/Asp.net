import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-secondary mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-4">CineTicket</h2>
                        <p className="text-gray-300 text-sm">
                            The ultimate cinema experience. Book your tickets online and enjoy the latest movies in theaters.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-primary text-sm">Home</Link>
                            </li>
                            <li>
                                <Link to="/movies" className="text-gray-300 hover:text-primary text-sm">Movies</Link>
                            </li>
                            <li>
                                <Link to="/cinemas" className="text-gray-300 hover:text-primary text-sm">Cinemas</Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-gray-300 hover:text-primary text-sm">My Tickets</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-300 text-sm">
                                <svg className="h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                support@cineticket.com
                            </li>
                            <li className="flex items-center text-gray-300 text-sm">
                                <svg className="h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +1 (555) 123-4567
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-6 text-center">
                    <p className="text-gray-300 text-sm">
                        &copy; {new Date().getFullYear()} CineTicket. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 