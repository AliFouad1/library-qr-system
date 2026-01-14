import React, { useState, useEffect } from 'react';
import { qrAPI } from '../services/api';

const QRScanner = () => {
  const [scanMode, setScanMode] = useState('book'); // 'book' or 'shelf'
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [manualId, setManualId] = useState('');

  const handleManualScan = async () => {
    if (!manualId.trim()) {
      setError('Please enter a Book ID or Shelf ID');
      return;
    }

    setError('');
    setScanning(true);
    
    try {
      let response;
      if (scanMode === 'book') {
        response = await qrAPI.scanBook({ bookId: manualId });
      } else {
        response = await qrAPI.scanShelf({ shelfId: manualId });
      }
      
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError('');
    setManualId('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">QR Scanner</h1>

      {/* Mode Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-600 mb-4">Select what you want to scan:</p>
        <div className="flex gap-4">
          <button
            onClick={() => { setScanMode('book'); resetScanner(); }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              scanMode === 'book'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📚 Scan Book
          </button>
          <button
            onClick={() => { setScanMode('shelf'); resetScanner(); }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              scanMode === 'shelf'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📍 Scan Shelf
          </button>
        </div>
      </div>

      {/* Manual Input */}
      {!result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            {scanMode === 'book' ? 'Enter Book ID' : 'Enter Shelf ID'}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            For demo purposes, enter the ID manually. In production, this would use camera scanning.
          </p>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder={scanMode === 'book' ? 'Book UUID' : 'Shelf UUID'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleManualScan}
              disabled={scanning}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {scanning ? 'Scanning...' : 'Scan'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-2">💡 How to get IDs:</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Go to "Books" page and click on any book to see its ID</li>
              <li>Or check the backend seed data for sample IDs</li>
              <li>Or create a new book and use its generated ID</li>
            </ol>
          </div>
        </div>
      )}

      {/* Book Scan Result */}
      {result && scanMode === 'book' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Book Details</h2>
            <button
              onClick={resetScanner}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Scan Another
            </button>
          </div>

          {result.qrCode && (
            <div className="flex justify-center mb-6">
              <img src={result.qrCode} alt="QR Code" className="w-48 h-48 border-4 border-blue-500 rounded-lg" />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Title</p>
              <p className="text-xl font-bold text-gray-800">{result.title}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Author</p>
              <p className="text-lg text-gray-800">{result.author}</p>
            </div>

            {result.isbn && (
              <div>
                <p className="text-sm text-gray-600">ISBN</p>
                <p className="text-lg text-gray-800">{result.isbn}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Availability</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.isAvailable ? '✓ Available' : '✗ Not Available'}
                </span>
                <span className="text-gray-600">
                  ({result.copiesAvailable}/{result.copiesTotal} copies)
                </span>
              </div>
            </div>

            {result.category && (
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg text-gray-800">📚 {result.category.name}</p>
              </div>
            )}

            {result.shelf && (
              <div>
                <p className="text-sm text-gray-600">Shelf Location</p>
                <p className="text-lg text-gray-800">
                  📍 {result.shelf.shelfCode} - {result.shelf.location}
                </p>
              </div>
            )}

            {result.currentBorrower && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-800 mb-2">Currently Borrowed</p>
                <p className="text-gray-800">
                  Borrower: {result.currentBorrower.user.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  Due: {new Date(result.currentBorrower.expectedReturnDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {result.borrowingHistory && result.borrowingHistory.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Recent Borrowing History</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.borrowingHistory.map((borrowing) => (
                    <div key={borrowing.id} className="bg-gray-50 p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{borrowing.user.fullName}</p>
                          <p className="text-sm text-gray-600">
                            Borrowed: {new Date(borrowing.borrowDate).toLocaleDateString()}
                          </p>
                          {borrowing.actualReturnDate && (
                            <p className="text-sm text-gray-600">
                              Returned: {new Date(borrowing.actualReturnDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            borrowing.status === 'RETURNED'
                              ? 'bg-green-100 text-green-800'
                              : borrowing.status === 'BORROWED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {borrowing.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {result.isAvailable && (
            <div className="mt-6">
              <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                Borrow This Book
              </button>
            </div>
          )}
        </div>
      )}

      {/* Shelf Scan Result */}
      {result && scanMode === 'shelf' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Shelf Details</h2>
            <button
              onClick={resetScanner}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Scan Another
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Shelf Code</p>
              <p className="text-xl font-bold text-gray-800">{result.shelf.shelfCode}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-lg text-gray-800">📍 {result.shelf.location}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{result.expectedBooks}</p>
                <p className="text-sm text-gray-600">Total Books</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{result.availableBooks}</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{result.borrowedBooks}</p>
                <p className="text-sm text-gray-600">Borrowed</p>
              </div>
            </div>
          </div>

          {/* Books on Shelf */}
          {result.books && result.books.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Books on This Shelf</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.books.map((book) => (
                  <div
                    key={book.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border hover:bg-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{book.title}</p>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      {book.category && (
                        <p className="text-xs text-gray-500">📚 {book.category}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          book.isBorrowed
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {book.isBorrowed ? 'Borrowed' : 'Available'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {book.copiesAvailable}/{book.copiesTotal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
