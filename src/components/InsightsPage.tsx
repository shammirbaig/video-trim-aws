import React, { useState, useEffect } from 'react';
import { 
  History, 
  Download, 
  Calendar, 
  FileVideo, 
  Music,
  Trash2,
  Filter,
  BarChart3,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  Clock,
  HardDrive,
  Eye,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';
import { videoAPI } from '../services/api';
import { useApi } from '../hooks/useApi';

const InsightsPage = () => {
  const { loading, error, execute } = useApi();
  const [downloads, setDownloads] = useState([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    completedVideos: 0,
    totalSize: 0,
    totalDownloads: 0
  });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const loadDownloads = async (page = 1) => {
    try {
      const result = await execute(() => videoAPI.getHistory({
        page,
        limit: 10,
        status: filter === 'all' ? undefined : filter,
        sortBy,
        sortOrder
      }), {
        onSuccess: (data) => {
          setDownloads(data.data.videos);
          setPagination(data.data.pagination);
          setStats(data.data.stats);
        }
      });
    } catch (err) {
      console.error('Failed to load downloads:', err);
    }
  };

  useEffect(() => {
    loadDownloads(currentPage);
  }, [filter, sortBy, sortOrder, currentPage]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await execute(() => videoAPI.deleteVideo(id), {
        onSuccess: () => {
          setDownloads(downloads.filter(d => d._id !== id));
        }
      });
    } catch (err) {
      console.error('Failed to delete video:', err);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await videoAPI.downloadVideo(id);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'video.mp4';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download video:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFormatIcon = (format) => {
    return format?.toLowerCase() === 'mp3' ? Music : FileVideo;
  };

  const getFormatColor = (format) => {
    const colors = {
      '4k': 'from-purple-500 to-pink-500',
      '1080p': 'from-blue-500 to-cyan-500',
      '720p': 'from-green-500 to-emerald-500',
      '480p': 'from-yellow-500 to-orange-500',
      '360p': 'from-gray-500 to-gray-600',
      'mp3': 'from-indigo-500 to-purple-500'
    };
    return colors[format?.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700',
      'processing': 'bg-blue-100 text-blue-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'failed': 'bg-red-100 text-red-700',
      'expired': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics Dashboard
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Download Insights
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Track your video processing history and analyze your content creation patterns
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 group hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Download className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stats.totalVideos}</div>
                    <div className="text-sm text-gray-600">Total Videos</div>
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stats.completedVideos} completed
                </div>
              </div>
              
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 group hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <HardDrive className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</div>
                    <div className="text-sm text-gray-600">Total Size</div>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  {stats.totalVideos > 0 ? formatFileSize(stats.totalSize / stats.totalVideos) : '0 MB'} avg
                </div>
              </div>
              
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 group hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Eye className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</div>
                    <div className="text-sm text-gray-600">Downloads</div>
                  </div>
                </div>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  <History className="w-4 h-4 mr-1" />
                  All time
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 group hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {stats.totalVideos > 0 ? Math.round((stats.completedVideos / stats.totalVideos) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Processing efficiency
                </div>
              </div>
            </motion.div>

            {/* Filters and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 text-gray-600 p-2 rounded-lg">
                      <Filter className="w-5 h-5" />
                    </div>
                    <select
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    >
                      <option value="all">All Files</option>
                      <option value="completed">Completed</option>
                      <option value="processing">Processing</option>
                      <option value="failed">Failed</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => loadDownloads(currentPage)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-medium text-gray-700"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                    Showing <span className="font-semibold">{downloads.length}</span> of <span className="font-semibold">{pagination.totalItems}</span> videos
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Downloads Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <div className="text-lg font-semibold text-gray-900 mb-2">Loading your downloads...</div>
                    <div className="text-gray-600">Fetching your video processing history</div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="bg-red-100 text-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Failed to load downloads</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
                  <button
                    onClick={() => loadDownloads(currentPage)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : downloads.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-100 text-gray-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No downloads found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {filter === 'all' 
                      ? "You haven't processed any videos yet. Start trimming to see your history here." 
                      : "No downloads match your current filter. Try adjusting your search criteria."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th 
                            className="text-left py-6 px-8 font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('title')}
                          >
                            <div className="flex items-center gap-2">
                              Video Details
                              <ArrowUpDown className="w-4 h-4" />
                            </div>
                          </th>
                          <th className="text-left py-6 px-8 font-bold text-gray-900">Status</th>
                          <th 
                            className="text-left py-6 px-8 font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('format')}
                          >
                            <div className="flex items-center gap-2">
                              Format
                              <ArrowUpDown className="w-4 h-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left py-6 px-8 font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('createdAt')}
                          >
                            <div className="flex items-center gap-2">
                              Date
                              <ArrowUpDown className="w-4 h-4" />
                            </div>
                          </th>
                          <th className="text-left py-6 px-8 font-bold text-gray-900">Size</th>
                          <th className="text-left py-6 px-8 font-bold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {downloads.map((download, index) => {
                          const FormatIcon = getFormatIcon(download.format);
                          const formatColor = getFormatColor(download.format);
                          const statusColor = getStatusColor(download.status);
                          
                          return (
                            <motion.tr
                              key={download._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50 transition-all group"
                            >
                              <td className="py-6 px-8">
                                <div className="flex items-center">
                                  <div className={`bg-gradient-to-br ${formatColor} text-white p-3 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <FormatIcon className="w-6 h-6" />
                                  </div>
                                  <div className="max-w-xs">
                                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{download.title}</h4>
                                    <p className="text-sm text-gray-600">
                                      {download.trimDurationFormatted || 'N/A'} duration
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-6 px-8">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                                  {download.status}
                                </span>
                              </td>
                              <td className="py-6 px-8">
                                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r ${formatColor} text-white shadow-lg`}>
                                  {download.format}
                                </span>
                              </td>
                              <td className="py-6 px-8 text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {formatDate(download.createdAt)}
                                </div>
                              </td>
                              <td className="py-6 px-8 text-gray-600 font-semibold">
                                {download.fileSizeFormatted || 'N/A'}
                              </td>
                              <td className="py-6 px-8">
                                <div className="flex items-center gap-3">
                                  {download.status === 'completed' && download.isAvailable ? (
                                    <motion.button 
                                      onClick={() => handleDownload(download._id)}
                                      className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Download className="w-4 h-4" />
                                      Download
                                    </motion.button>
                                  ) : (
                                    <span className="text-gray-400 text-sm font-medium">
                                      {download.status === 'processing' ? 'Processing...' : 
                                       download.status === 'failed' ? 'Failed' : 
                                       download.status === 'expired' ? 'Expired' : 'Unavailable'}
                                    </span>
                                  )}
                                  <motion.button 
                                    onClick={() => handleDelete(download._id)}
                                    className="text-gray-400 hover:text-red-600 p-2 rounded-xl transition-colors hover:bg-red-50"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 bg-gray-50">
                      <div className="text-sm text-gray-600">
                        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{pagination.totalPages}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-3 rounded-xl border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                          disabled={currentPage === pagination.totalPages}
                          className="p-3 rounded-xl border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InsightsPage;