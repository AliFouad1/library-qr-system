import React, { useState, useEffect } from 'react';
import { booksAPI, categoriesAPI, shelvesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Books = () => {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    categoryId: '',
    shelfId: '',
    copiesTotal: 1,
    description: '',
    publicationYear: ''
  });
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchShelves();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [search]);

  const fetchBooks = async () => {
    try {
      // Don't set loading during search to prevent input from losing focus
      const response = await booksAPI.getAll({ search, limit: 50 });
      setBooks(response.data.data.books);
      setError('');
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchShelves = async () => {
    try {
      const response = await shelvesAPI.getAll();
      setShelves(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch shelves:', err);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await booksAPI.create({
        ...newBook,
        copiesTotal: parseInt(newBook.copiesTotal),
        publicationYear: newBook.publicationYear ? parseInt(newBook.publicationYear) : null,
        categoryId: newBook.categoryId || null,
        shelfId: newBook.shelfId || null
      });
      alert('Book added successfully!');
      setShowAddModal(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        categoryId: '',
        shelfId: '',
        copiesTotal: 1,
        description: '',
        publicationYear: ''
      });
      fetchBooks();
    } catch (err) {
      alert('Failed to add book: ' + (err.response?.data?.error?.message || 'Unknown error'));
    }
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      await booksAPI.update(editingBook.id, {
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn,
        copiesTotal: parseInt(editingBook.copiesTotal),
        publicationYear: editingBook.publicationYear ? parseInt(editingBook.publicationYear) : null,
        categoryId: editingBook.categoryId || null,
        shelfId: editingBook.shelfId || null,
        description: editingBook.description
      });
      alert('Book updated successfully!');
      setShowEditModal(false);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      alert('Failed to update book: ' + (err.response?.data?.error?.message || 'Unknown error'));
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await booksAPI.delete(bookId);
      alert('Book deleted successfully!');
      fetchBooks();
    } catch (err) {
      alert('Failed to delete book: ' + (err.response?.data?.error?.message || 'Unknown error'));
    }
  };

  const openEditModal = (book) => {
    setEditingBook({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      categoryId: book.categoryId || '',
      shelfId: book.shelfId || '',
      copiesTotal: book.copiesTotal,
      description: book.description || '',
      publicationYear: book.publicationYear || ''
    });
    setShowEditModal(true);
  };

  const viewBookDetails = async (bookId) => {
    try {
      const response = await booksAPI.getById(bookId);
      setSelectedBook(response.data.data);
    } catch (err) {
      console.error('Failed to fetch book details:', err);
    }
  };

  const closeModal = () => {
    setSelectedBook(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
            <svg className="w-7 h-7 sm:w-10 sm:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Library Books
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Browse and manage your collection</p>
        </div>
        {isStaffOrAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 font-medium text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Book
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 hover:border-gray-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-md flex items-center gap-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            {/* QR Code */}
            {book.qrCode && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6 flex justify-center border-b border-gray-100">
                <img src={book.qrCode} alt="QR Code" className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl shadow-md" />
              </div>
            )}

            {/* Book Info */}
            <div className="p-6">
              <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => viewBookDetails(book.id)}>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 line-clamp-2 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
                  {book.title}
                </h3>
                <p className="text-gray-600 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {book.author}
                </p>

              {book.isbn && (
                <p className="text-sm text-gray-500 mb-4 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">ISBN: {book.isbn}</p>
              )}

              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-xl">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                    book.copiesAvailable > 0
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                      : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                  }`}
                >
                  {book.copiesAvailable > 0 ? 'AVAILABLE' : 'NOT AVAILABLE'}
                </span>
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {book.copiesAvailable}/{book.copiesTotal}
                </span>
              </div>

              {/* Category & Shelf */}
              <div className="text-sm space-y-2 mb-4">
                {book.category && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="text-blue-600">📚</span>
                    <span className="text-blue-700 font-medium">{book.category.name}</span>
                  </div>
                )}
                {book.shelf && (
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                    <span className="text-purple-600">📍</span>
                    <span className="text-purple-700 font-medium">{book.shelf.shelfCode}</span>
                  </div>
                )}
              </div>
              </div>

              {/* Action Buttons - Only visible to Admin/Staff */}
              {isStaffOrAdmin && (
                <div className="flex gap-3 px-6 pb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(book);
                    }}
                    className="group/btn flex-1 relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm font-bold">Edit</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-200"></div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBook(book.id, book.title);
                    }}
                    className="group/btn flex-1 relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm font-bold">Delete</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-200"></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Books Found</h3>
          <p className="text-gray-600 mb-6">
            {search ? 'Try adjusting your search terms' : 'Start by adding your first book to the library'}
          </p>
          {!search && isStaffOrAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Book
            </button>
          )}
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slideUp">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Edit Book</h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditBook} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  ISBN
                </label>
                <input
                  type="text"
                  value={editingBook.isbn}
                  onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📚 Category
                  </label>
                  <select
                    value={editingBook.categoryId}
                    onChange={(e) => setEditingBook({ ...editingBook, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📍 Shelf
                  </label>
                  <select
                    value={editingBook.shelfId}
                    onChange={(e) => setEditingBook({ ...editingBook, shelfId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="">Select Shelf</option>
                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.shelfCode} - {shelf.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingBook.copiesTotal}
                    onChange={(e) => setEditingBook({ ...editingBook, copiesTotal: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="2100"
                    value={editingBook.publicationYear}
                    onChange={(e) => setEditingBook({ ...editingBook, publicationYear: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editingBook.description}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-300 resize-none"
                  placeholder="Enter a brief description of the book..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slideUp">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Add New Book</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddBook} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300"
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  ISBN
                </label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300 font-mono"
                  placeholder="Enter ISBN (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📚 Category
                  </label>
                  <select
                    value={newBook.categoryId}
                    onChange={(e) => setNewBook({ ...newBook, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📍 Shelf
                  </label>
                  <select
                    value={newBook.shelfId}
                    onChange={(e) => setNewBook({ ...newBook, shelfId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                  >
                    <option value="">Select Shelf</option>
                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.shelfCode} - {shelf.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBook.copiesTotal}
                    onChange={(e) => setNewBook({ ...newBook, copiesTotal: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="2100"
                    value={newBook.publicationYear}
                    onChange={(e) => setNewBook({ ...newBook, publicationYear: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300 resize-none"
                  placeholder="Enter a brief description of the book..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slideUp">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedBook.title}</h2>
                  </div>
                  <p className="text-white/90 ml-14">by {selectedBook.author}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedBook.qrCode && (
                <div className="flex justify-center mb-6 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
                  <img src={selectedBook.qrCode} alt="QR Code" className="w-48 h-48 rounded-xl shadow-lg" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedBook.isbn && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm font-bold text-blue-600 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      ISBN
                    </p>
                    <p className="text-lg font-semibold text-gray-800 font-mono">{selectedBook.isbn}</p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm font-bold text-green-600 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${
                      selectedBook.copiesAvailable > 0
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                        : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                    }`}
                  >
                    {selectedBook.copiesAvailable > 0 ? '✓ AVAILABLE' : '✗ NOT AVAILABLE'}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-sm font-bold text-purple-600 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Copies Available
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedBook.copiesAvailable} / {selectedBook.copiesTotal} total
                  </p>
                </div>

                {selectedBook.publicationYear && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-sm font-bold text-orange-600 mb-1">Publication Year</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedBook.publicationYear}</p>
                  </div>
                )}
              </div>

              {(selectedBook.category || selectedBook.shelf) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {selectedBook.category && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm font-bold text-blue-600 mb-1">📚 Category</p>
                      <p className="text-lg font-semibold text-gray-800">{selectedBook.category.name}</p>
                    </div>
                  )}

                  {selectedBook.shelf && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                      <p className="text-sm font-bold text-indigo-600 mb-1">📍 Shelf Location</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedBook.shelf.shelfCode} - {selectedBook.shelf.location}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedBook.description && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </p>
                  <p className="text-gray-700 leading-relaxed">{selectedBook.description}</p>
                </div>
              )}

              {selectedBook.borrowings && selectedBook.borrowings.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Borrowing History
                  </p>
                  <div className="space-y-2">
                    {selectedBook.borrowings.slice(0, 5).map((borrowing) => (
                      <div key={borrowing.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{borrowing.user.fullName}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(borrowing.borrowDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            borrowing.status === 'BORROWED' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {borrowing.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
