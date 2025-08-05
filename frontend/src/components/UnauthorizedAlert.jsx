import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { ShieldX } from 'lucide-react';

const UnauthorizedAlert = ({ isOpen, onClose, onLogin }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <ShieldX className="h-6 w-6 text-red-500" />
            <AlertDialogTitle>Access Restricted</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            You need to be logged in to access the dashboard. Please sign in to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogAction
            onClick={onLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onClose}
            variant="outline"
            className="mt-2 sm:mt-0"
          >
            Go Back
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnauthorizedAlert;
