import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Shield } from 'lucide-react';

const AuthGuard = ({ children, onAuthRequired }) => {
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleAuthRequired = () => {
    if (!user) {
      setShowAuthAlert(true);
      return false;
    }
    return true;
  };

  const handleSignIn = () => {
    setShowAuthAlert(false);
    if (onAuthRequired) {
      onAuthRequired();
    }
  };

  // Wrap children with auth check
  const wrappedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        onClick: (e) => {
          if (!handleAuthRequired()) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (child.props.onClick) {
            child.props.onClick(e);
          }
        }
      });
    }
    return child;
  });

  return (
    <>
      {wrappedChildren}
      <AlertDialog open={showAuthAlert} onOpenChange={setShowAuthAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-500" />
              <AlertDialogTitle>Sign In Required</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              You need to sign in to access this feature. Please sign in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSignIn}>
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AuthGuard;
