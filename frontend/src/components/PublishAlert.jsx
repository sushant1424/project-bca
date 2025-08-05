import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

const PublishAlert = ({ isOpen, onClose, type = 'success', message }) => {
  const getIcon = () => {
    return type === 'success' ? 
      <CheckCircle className="w-6 h-6 text-green-500" /> : 
      <AlertTriangle className="w-6 h-6 text-red-500" />;
  };

  const getTitle = () => {
    return type === 'success' ? 'Post Published!' : 'Publishing Failed';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            {getIcon()}
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PublishAlert;
