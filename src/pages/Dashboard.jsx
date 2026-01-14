import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, booksAPI, borrowingAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [dashboard, bookStats, borrowingStats] = await Promise.all([
        reportsAPI.getDashboard(),
        booksAPI.getStats(),
        borrowingAPI.getStats()
      ]);

      setStats({
        ...dashboard.data.data,
        ...bookStats.data.data,
        ...borrowingStats.data.data
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const cards = [
    { 
      title: 'Total Books', 
      value: stats?.totalBooks || 0, 
      color: 'blue',
      icon: '📚',
      description: 'Books in library'
    },
    { 
      title: 'Available Books', 
      value: stats?.availableBooks || 0, 
      color: 'green',
      icon: '✅',
      description: 'Ready to borrow'
    },
    { 
      title: 'Active Borrowings', 
      value: stats?.activeBorrowings || 0, 
      color: 'yellow',
      icon: '📖',
      description: 'Currently borrowed'
    },
    { 
      title: 'Overdue Books', 
      value: stats?.overdueBooks || 0, 
      color: 'red',
      icon: '⚠️',
      description: 'Need attention'
    },
  ];

  const cardColors = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-teal-600',
    yellow: 'from-yellow-500 to-orange-600',
    red: 'from-red-500 to-pink-600'
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your library management system</p>
        </div>
        <button
          onClick={fetchStats}
          className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`group relative bg-gradient-to-br ${cardColors[card.color]} rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden`}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <span className="text-3xl">{card.icon}</span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="text-white text-xs font-bold">{card.title}</span>
                </div>
              </div>

              <div className="text-white">
                <p className="text-5xl font-bold mb-2 drop-shadow-lg">{card.value}</p>
                <p className="text-white/90 text-sm font-medium">{card.description}</p>
              </div>
            </div>

            {/* Decorative corner element */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-full transform translate-x-16 translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link
              to="/books"
              className="group relative flex items-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-200 overflow-hidden"
            >
              <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-blue-500 to-indigo-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">View All Books</p>
                <p className="text-sm text-gray-600">Browse and manage library books</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/borrow"
              className="group relative flex items-center p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-200 overflow-hidden"
            >
              <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-green-500 to-teal-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">Manage Borrowing</p>
                <p className="text-sm text-gray-600">Borrow or return books</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            System Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Status
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                <span className="text-green-600 font-bold">Online</span>
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <span className="text-gray-700 font-medium">Total Copies</span>
              <span className="font-bold text-blue-600 text-xl">{stats?.totalCopies || 0}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <span className="text-gray-700 font-medium">Available Copies</span>
              <span className="font-bold text-purple-600 text-xl">{stats?.availableCopies || 0}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last Updated
              </span>
              <span className="text-sm text-gray-700 font-medium">{new Date().toLocaleTimeString()}</span>
            </div>

          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Library Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.totalBooks || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Total Books</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats?.availableBooks || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Available</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats?.borrowedBooks || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Borrowed</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats?.overdueBooks || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
