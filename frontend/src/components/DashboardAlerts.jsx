import React from 'react';
import { CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

// Success Alert for publishing posts
export const PublishSuccessAlert = ({ isOpen, onClose, postTitle }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <AlertDialogTitle>Post Published Successfully!</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          Your post "{postTitle}" has been published and is now visible to all users.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={onClose}>Great!</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Error Alert for publishing failures
export const PublishErrorAlert = ({ isOpen, onClose, error }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <AlertDialogTitle>Publishing Failed</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          We couldn't publish your post. {error || 'Please try again later.'}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={onClose}>Try Again</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Delete Confirmation Alert
export const DeletePostAlert = ({ isOpen, onClose, onConfirm, postTitle }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center space-x-3">
          <Trash2 className="w-6 h-6 text-red-500" />
          <AlertDialogTitle>Delete Post</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          Are you sure you want to delete "{postTitle}"? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Navigation Confirmation Alert (when leaving unsaved changes)
export const UnsavedChangesAlert = ({ isOpen, onClose, onConfirm }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center space-x-3">
          <Info className="w-6 h-6 text-blue-500" />
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Stay</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Leave</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Generic Success Alert
export const SuccessAlert = ({ isOpen, onClose, title, message }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          {message}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Generic Error Alert
export const ErrorAlert = ({ isOpen, onClose, title, message }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          {message}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
