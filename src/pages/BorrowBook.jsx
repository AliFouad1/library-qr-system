import React, { useState, useEffect } from 'react';
import { borrowingAPI, booksAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BorrowBook = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewBorrowingModal, setShowNewBorrowingModal] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [searchBook, setSearchBook] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const response = await borrowingAPI.getAll({ limit: 50 });
      setBorrowings(response.data.data.borrowings);
    } catch (err) {
      setError('Failed to load borrowings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowingId) => {
    if (!confirm('Are you sure you want to return this book?')) return;

    try {
      await borrowingAPI.return(borrowingId);
      alert('Book returned successfully!');
      fetchBorrowings();
    } catch (err) {
      alert('Failed to return book: ' + (err.response?.data?.error?.message || 'Unknown error'));
    }
  };

  const handleExtend = async (borrowingId) => {
    const days = prompt('How many additional days?', '7');
    if (!days) return;

    try {
      await borrowingAPI.extend(borrowingId, parseInt(days));
      alert('Borrowing period extended successfully!');
      fetchBorrowings();
    } catch (err) {
      alert('Failed to extend: ' + (err.response?.data?.error?.message || 'Unknown error'));
    }
  };

  const fetchAvailableBooks = async () => {
    try {
      const response = await booksAPI.getAll({ search: searchBook, limit: 50 });
      // Filter only available books
      const available = response.data.data.books.filter(book => book.copiesAvailable > 0);
      setAvailableBooks(available);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  const handleNewBorrowing = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      alert('Please select a book');
      return;
    }

    // For admin, require user selection
    if (user.role === 'ADMIN' && !selectedUserId) {
      alert('Please select a user to borrow the book');
      return;
    }

    try {
      const borrowData = {
        bookId: selectedBookId,
        // Admin can specify userId, otherwise it borrows to current user
        ...(user.role === 'ADMIN' && selectedUserId ? { userId: selectedUserId } : {})
      };

      await borrowingAPI.borrow(borrowData);
      alert('Book borrowed successfully!');
      setShowNewBorrowingModal(false);
      setSelectedBookId('');
      setSelectedUserId('');
      setSearchBook('');
      fetchBorrowings();
    } catch (err) {
      alert('Failed to borrow book: ' + (err.response?.data?.error?.message || 'Unknown error'));
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      // Filter to only show active users
      const activeUsers = response.data.data.filter(u => u.status === 'ACTIVE');
      setUsers(activeUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const openNewBorrowingModal = () => {
    setShowNewBorrowingModal(true);
    fetchAvailableBooks();
    if (user.role === 'ADMIN') {
      fetchUsers();
    }
  };

  useEffect(() => {
    if (showNewBorrowingModal) {
      const timer = setTimeout(() => {
        fetchAvailableBooks();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchBook]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Loading borrowings...</p>
        </div>
      </div>
    );
  }

  const activeBorrowings = borrowings.filter(b => b.status === 'BORROWED' || b.status === 'OVERDUE');
  const returnedBorrowings = borrowings.filter(b => b.status === 'RETURNED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
            <svg className="w-7 h-7 sm:w-10 sm:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Borrowing
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Track and manage book borrowings</p>
        </div>
        {user.role === 'ADMIN' && (
          <button
            onClick={openNewBorrowingModal}
            className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 font-medium text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Borrowing
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-md flex items-center gap-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-white">
              <p className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg">{borrowings.length}</p>
              <p className="text-white/90 text-sm font-medium">Total Borrowings</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-white">
              <p className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg">{activeBorrowings.length}</p>
              <p className="text-white/90 text-sm font-medium">Active Borrowings</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="text-white">
              <p className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg">{returnedBorrowings.length}</p>
              <p className="text-white/90 text-sm font-medium">Books Returned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Borrowings */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Active Borrowings
        </h2>

        {activeBorrowings.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Borrowings</h3>
            <p className="text-gray-600">All books are currently available in the library</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBorrowings.map((borrowing) => (
              <div
                key={borrowing.id}
                className={`group relative rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                  borrowing.status === 'OVERDUE'
                    ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50'
                    : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-yellow-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${borrowing.status === 'OVERDUE' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        <svg className={`w-6 h-6 ${borrowing.status === 'OVERDUE' ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {borrowing.book.title}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          by {borrowing.book.author}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="bg-white/50 p-3 rounded-xl border border-gray-200">
                        <p className="text-xs font-bold text-gray-600 mb-1">Borrower</p>
                        <p className="font-semibold text-gray-800">{borrowing.user.fullName}</p>
                        <p className="text-sm text-gray-600">{borrowing.user.email}</p>
                      </div>

                      <div className="bg-white/50 p-3 rounded-xl border border-gray-200">
                        <p className="text-xs font-bold text-gray-600 mb-1">Borrowed Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(borrowing.borrowDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className={`p-3 rounded-xl border ${
                        borrowing.status === 'OVERDUE'
                          ? 'bg-red-100 border-red-300'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <p className="text-xs font-bold text-gray-600 mb-1">Due Date</p>
                        <p className={`font-semibold ${borrowing.status === 'OVERDUE' ? 'text-red-700' : 'text-gray-800'}`}>
                          {new Date(borrowing.expectedReturnDate).toLocaleDateString()}
                        </p>
                      </div>

                      {borrowing.status === 'OVERDUE' && (
                        <div className="bg-red-100 p-3 rounded-xl border border-red-300">
                          <p className="text-xs font-bold text-red-600 mb-1">OVERDUE</p>
                          <p className="font-bold text-red-700 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {Math.floor(
                              (new Date() - new Date(borrowing.expectedReturnDate)) / (1000 * 60 * 60 * 24)
                            )} days
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 justify-end">
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm whitespace-nowrap self-start ${
                        borrowing.status === 'OVERDUE'
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                      }`}
                    >
                      {borrowing.status}
                    </span>

                    {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                      <>
                        <button
                          onClick={() => handleReturn(borrowing.id)}
                          className="group/btn px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Return
                        </button>
                        <button
                          onClick={() => handleExtend(borrowing.id)}
                          className="group/btn px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Extend
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Returned Borrowings */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recently Returned
        </h2>

        {returnedBorrowings.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Returned Books Yet</h3>
            <p className="text-gray-600">Returned books will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {returnedBorrowings.slice(0, 10).map((borrowing) => (
              <div
                key={borrowing.id}
                className="group relative bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {borrowing.book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">by {borrowing.book.author}</p>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-green-200">
                          <span className="text-gray-600 font-medium">Borrower: </span>
                          <span className="text-gray-800 font-bold">{borrowing.user.fullName}</span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-green-200">
                          <span className="text-gray-600 font-medium">Borrowed: </span>
                          <span className="text-gray-800 font-bold">
                            {new Date(borrowing.borrowDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-green-200">
                          <span className="text-gray-600 font-medium">Returned: </span>
                          <span className="text-gray-800 font-bold">
                            {new Date(borrowing.actualReturnDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-sm whitespace-nowrap self-start">
                    RETURNED
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Borrowing Modal */}
      {showNewBorrowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slideUp">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">New Borrowing</h2>
                </div>
                <button
                  onClick={() => setShowNewBorrowingModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleNewBorrowing} className="p-6 space-y-5">
                {user.role === 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Select User *
                    </label>
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                    >
                      <option value="">Select a user to borrow for...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.email}) - {u.role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Books
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by title, author, or ISBN..."
                      value={searchBook}
                      onChange={(e) => setSearchBook(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Select Book *
                  </label>
                  <div className="max-h-[400px] overflow-y-auto border-2 border-gray-200 rounded-2xl bg-gray-50">
                    {availableBooks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-3">📚</div>
                        <p className="text-gray-600 font-medium">No available books found</p>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {availableBooks.map((book) => (
                          <div
                            key={book.id}
                            onClick={() => setSelectedBookId(book.id)}
                            className={`p-4 cursor-pointer transition-all duration-200 ${
                              selectedBookId === book.id
                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  {selectedBookId === book.id && (
                                    <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                  <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 mb-1">{book.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                                    {book.isbn && (
                                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block mb-2">
                                        ISBN: {book.isbn}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      {book.category && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium">
                                          📚 {book.category.name}
                                        </span>
                                      )}
                                      {book.shelf && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-medium">
                                          📍 {book.shelf.shelfCode}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="bg-green-100 px-3 py-2 rounded-xl border border-green-200">
                                  <span className="text-lg font-bold text-green-700 block">
                                    {book.copiesAvailable}
                                  </span>
                                  <p className="text-xs text-green-600 font-medium">available</p>
                                  <p className="text-xs text-gray-500">of {book.copiesTotal}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-indigo-800">
                      <strong className="font-bold">Note:</strong> {user.role === 'ADMIN'
                        ? 'The book will be borrowed to the selected user.'
                        : `The book will be borrowed to your account (${user.fullName}).`}
                      {' '}Default borrowing period is 14 days.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!selectedBookId || (user.role === 'ADMIN' && !selectedUserId)}
                    className={`flex-1 px-6 py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedBookId && (user.role !== 'ADMIN' || selectedUserId)
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Borrow Book
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewBorrowingModal(false);
                      setSelectedBookId('');
                      setSelectedUserId('');
                      setSearchBook('');
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowBook;
