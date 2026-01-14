import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PublicBookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Use public endpoint (no authentication required)
      const response = await axios.get(`${API_URL}/books/public/${bookId}`);
      setBook(response.data.data);
      setError('');
    } catch (err) {
      setError('Book not found or an error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading book information...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Please check the QR code or contact the library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Library Book Information</h1>
          <p className="text-gray-600">Scan results for QR code</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* QR Code Display */}
          {book.qrCode && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
              <img
                src={book.qrCode}
                alt="Book QR Code"
                className="w-48 h-48 mx-auto bg-white p-4 rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Book Details */}
          <div className="p-8">
            {/* Title and Author */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h2>
              <p className="text-xl text-gray-600">by {book.author}</p>
            </div>

            {/* Availability Status */}
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Availability Status</p>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        book.copiesAvailable > 0
                          ? 'bg-green-100 text-green-800 border-2 border-green-300'
                          : 'bg-red-100 text-red-800 border-2 border-red-300'
                      }`}
                    >
                      {book.copiesAvailable > 0 ? '✓ Available' : '✗ Not Available'}
                    </span>
                    <span className="text-lg font-semibold text-gray-700">
                      {book.copiesAvailable} / {book.copiesTotal} copies
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {book.isbn && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">ISBN</p>
                  <p className="text-lg font-semibold text-gray-800">{book.isbn}</p>
                </div>
              )}

              {book.publicationYear && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Publication Year</p>
                  <p className="text-lg font-semibold text-gray-800">{book.publicationYear}</p>
                </div>
              )}

              {book.category && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="text-lg font-semibold text-gray-800">📚 {book.category.name}</p>
                </div>
              )}

              {book.shelf && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Shelf Location</p>
                  <p className="text-lg font-semibold text-gray-800">
                    📍 {book.shelf.shelfCode} - {book.shelf.location}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Current Borrower Info */}
            {book.borrowings && book.borrowings.length > 0 && book.borrowings[0].status === 'BORROWED' && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Currently Borrowed</h3>
                <p className="text-gray-700">
                  This book is currently checked out and will be available after{' '}
                  <span className="font-semibold">
                    {new Date(book.borrowings[0].expectedReturnDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">
                {book.copiesAvailable > 0
                  ? 'This book is available for borrowing! Visit the library to check it out.'
                  : 'This book is currently unavailable. Please check back later or contact the library.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`mailto:library@example.com?subject=Inquiry about: ${encodeURIComponent(book.title)}`}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  📧 Contact Library
                </a>
                {book.copiesAvailable > 0 && (
                  <button
                    onClick={() => alert('Please visit the library desk to borrow this book.')}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    📖 Reserve Book
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Powered by Library Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicBookDetail;
