import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const PublicBookDetail = () => {
  const { t, i18n } = useTranslation();
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/books/public/${bookId}`);
      setBook(response.data.data);
      setError('');
    } catch (err) {
      setError(t('publicBook.notFound'));
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
          <p className="mt-4 text-gray-600 text-lg">{t('publicBook.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="absolute top-4 end-4 z-10 bg-white/80 hover:bg-white px-4 py-2 rounded-xl text-gray-700 font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {currentLanguage === 'ar' ? 'English' : 'العربية'}
        </button>

        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('publicBook.notFound')}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">{t('publicBook.checkQr')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 end-4 z-10 bg-white/80 hover:bg-white px-4 py-2 rounded-xl text-gray-700 font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {currentLanguage === 'ar' ? 'English' : 'العربية'}
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 {t('publicBook.title')}</h1>
          <p className="text-gray-600">{t('publicBook.scanResults')}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Cover Image and QR Code Display */}
          <div className="relative h-64 sm:h-80 bg-gradient-to-r from-blue-600 to-indigo-600">
            {/* Cover Image Background */}
            {book.coverImage ? (
              <>
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${book.coverImage}`}
                  alt={book.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"></div>
              </>
            ) : null}

            {/* QR Code positioned on top */}
            {book.qrCode && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-3 rounded-xl shadow-2xl">
                  <img
                    src={book.qrCode}
                    alt="Book QR Code"
                    className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Book Title overlay at bottom */}
            {book.coverImage && (
              <div className="absolute bottom-0 inset-x-0 p-4 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{book.title}</h2>
                <p className="text-white/90 drop-shadow">{t('common.by')} {book.author}</p>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="p-8">
            {/* Title and Author (only show if no cover image) */}
            {!book.coverImage && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h2>
                <p className="text-xl text-gray-600">{t('common.by')} {book.author}</p>
              </div>
            )}
            {/* Show smaller title if cover image exists */}
            {book.coverImage && (
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{book.title}</h2>
                <p className="text-lg text-gray-600">{t('common.by')} {book.author}</p>
              </div>
            )}

            {/* Availability Status */}
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('publicBook.availability')}</p>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        book.copiesAvailable > 0
                          ? 'bg-green-100 text-green-800 border-2 border-green-300'
                          : 'bg-red-100 text-red-800 border-2 border-red-300'
                      }`}
                    >
                      {book.copiesAvailable > 0 ? `✓ ${t('publicBook.availableStatus')}` : `✗ ${t('publicBook.notAvailableStatus')}`}
                    </span>
                    <span className="text-lg font-semibold text-gray-700">
                      {book.copiesAvailable} / {book.copiesTotal} {t('publicBook.copies')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {book.isbn && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t('publicBook.isbn')}</p>
                  <p className="text-lg font-semibold text-gray-800">{book.isbn}</p>
                </div>
              )}

              {book.publicationYear && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t('publicBook.publicationYear')}</p>
                  <p className="text-lg font-semibold text-gray-800">{book.publicationYear}</p>
                </div>
              )}

              {book.category && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t('publicBook.category')}</p>
                  <p className="text-lg font-semibold text-gray-800">📚 {book.category.name}</p>
                </div>
              )}

              {book.shelf && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t('publicBook.shelfLocation')}</p>
                  <p className="text-lg font-semibold text-gray-800">
                    📍 {book.shelf.shelfCode} - {book.shelf.location}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t('publicBook.description')}</h3>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Current Borrower Info */}
            {book.borrowings && book.borrowings.length > 0 && book.borrowings[0].status === 'BORROWED' && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ {t('publicBook.currentlyBorrowed')}</h3>
                <p className="text-gray-700">
                  {t('publicBook.availableAfter')}{' '}
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
                  ? t('publicBook.availableForBorrow')
                  : t('publicBook.currentlyUnavailable')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`mailto:library@example.com?subject=Inquiry about: ${encodeURIComponent(book.title)}`}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  📧 {t('publicBook.contactLibrary')}
                </a>
                {book.copiesAvailable > 0 && (
                  <button
                    onClick={() => alert(t('publicBook.visitDesk'))}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    📖 {t('publicBook.reserveBook')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            {t('publicBook.poweredBy')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicBookDetail;
