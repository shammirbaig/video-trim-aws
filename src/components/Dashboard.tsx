import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Download, 
  Calendar, 
  FileVideo, 
  Music,
  Trash2,
  Filter,
  BarChart3,
  Loader2
} from 'lucide-react';
import Header from './Header';

interface DownloadRecord {
  id: string;
  title: string;
  format: string;
  date: string;
  size: string;
  downloadUrl?: string;
  available: boolean;
}

const Dashboard = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock data for demonstration
  const mockDownloads: DownloadRecord[] = [
    {
      id: '1',
      title: 'How to Create Amazing Content in 2024',
      format: '1080p',
      date: '2024-01-15T10:30:00Z',
      size: '125 MB',
      available: true
    },
    {
      id: '2',
      title: 'Best Marketing Strategies for Small Business',
      format: 'MP3',
      date: '2024-01-14T15:45:00Z',
      size: '8.5 MB',
      available: false
    },
    {
      id: '3',
      title: 'Learn React in 30 Minutes',
      format: '720p',
      date: '2024-01-13T09:15:00Z',
      size: '89 MB',
      available: true
    },
    {
      id: '4',
      title: 'Advanced Photography Techniques',
      format: '4K',
      date: '2024-01-12T14:20:00Z',
      size: '450 MB',
      available: false
    },
    {
      id: '5',
      title: 'Productivity Hacks for Entrepreneurs',
      format: '1080p',
      date: '2024-01-11T11:00:00Z',
      size: '156 MB',
      available: true
    }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Load downloads
  useEffect(() => {
    const loadDownloads = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDownloads(mockDownloads);
      setLoading(false);
    };

    if (isSignedIn) {
      loadDownloads();
    }
  }, [isSignedIn]);

  const totalSize = downloads.reduce((acc, download) => {
    const sizeInMB = parseFloat(download.size.replace(/[^\d.]/g, ''));
    return acc + (download.size.includes('GB') ? sizeInMB * 1024 : sizeInMB);
  }, 0);

  const formatFileSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFormatIcon = (format: string) => {
    return format.toLowerCase() === 'mp3' ? Music : FileVideo;
  };

  const filteredDownloads = downloads
    .filter(download => {
      if (filter === 'all') return true;
      if (filter === 'video') return !download.format.toLowerCase().includes('mp3');
      if (filter === 'audio') return download.format.toLowerCase().includes('mp3');
      if (filter === 'available') return download.available;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'format') {
        return a.format.localeCompare(b.format);
      }
      return 0;
    });

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Your Download History
            </h1>
            <p className="text-xl text-gray-600">
              Manage and track all your video downloads
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mr-4">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{downloads.length}</h3>
                  <p className="text-gray-600">Total Downloads</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="bg-green-100 text-green-600 p-3 rounded-xl mr-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</h3>
                  <p className="text-gray-600">Total Downloaded</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-xl mr-4">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {downloads.filter(d => d.available).length}
                  </h3>
                  <p className="text-gray-600">Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Files</option>
                    <option value="video">Video Only</option>
                    <option value="audio">Audio Only</option>
                    <option value="available">Available</option>
                  </select>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="format">Sort by Format</option>
                </select>
              </div>
              
              <button
                onClick={() => navigate('/trim')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Trim New Video
              </button>
            </div>
          </div>

          {/* Downloads Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span className="text-gray-600">Loading your downloads...</span>
              </div>
            ) : filteredDownloads.length === 0 ? (
              <div className="text-center py-16">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No downloads found</h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all' 
                    ? "You haven't downloaded any videos yet." 
                    : "No downloads match your current filter."}
                </p>
                <button
                  onClick={() => navigate('/trim')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Trimming Videos
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Video</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Format</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Size</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDownloads.map((download) => {
                      const FormatIcon = getFormatIcon(download.format);
                      return (
                        <tr key={download.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="bg-gray-100 text-gray-600 p-3 rounded-lg mr-4">
                                <FormatIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">{download.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {download.available ? 'Available for download' : 'Link expired'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {download.format}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(download.date)}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-600 font-medium">
                            {download.size}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {download.available ? (
                                <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">Expired</span>
                              )}
                              <button className="text-gray-400 hover:text-red-600 p-2 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;