import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfilePopover = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleViewProfile = () => {
    setOpen(false); // Close popover
    navigate(`/profile`); // Navigate to own profile
  };

  const handleLogout = () => {
    setOpen(false); // Close popover
    onLogout(); // Call logout function
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.username} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
              {user?.username?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar} alt={user?.username} />
            <AvatarFallback className="bg-gray-100 text-gray-600">
              {user?.username?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 break-all">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="p-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-left hover:bg-gray-50"
            onClick={handleViewProfile}
          >
            <User className="mr-3 h-4 w-4" />
            View Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfilePopover;
