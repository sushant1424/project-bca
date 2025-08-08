import React, { useEffect } from 'react';
import { Bell, Check, Trash2, Heart, MessageCircle, UserPlus, TrendingUp, Award } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'trending': return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case 'goal_completed': return <Award className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.related_object_data?.type === 'post') {
      navigate(`/post/${notification.related_object_data.id}`);
    } else if (notification.notification_type === 'follow' && notification.sender) {
      navigate(`/user/${notification.sender.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading notifications...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="ml-3 bg-red-500 text-white text-sm rounded-full px-2 py-1">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          <p className="text-gray-600">
            Stay updated with all your interactions and activities on Wrytera
          </p>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-3">No notifications yet</h3>
            <p className="text-gray-500 text-lg">We'll notify you when something interesting happens!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full"></div>
                )}

                <div className="flex items-start space-x-4 ml-6">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className={`text-base mb-3 ${!notification.is_read ? 'text-gray-700' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        
                        {/* Sender info */}
                        {notification.sender && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {notification.sender.username?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {notification.sender.username}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-400">
                          {notification.time_ago}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
