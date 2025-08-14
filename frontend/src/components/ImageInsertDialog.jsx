import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Image as ImageIcon, Link, Upload, X } from 'lucide-react';

const ImageInsertDialog = ({ isOpen, onClose, onInsert }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [activeTab, setActiveTab] = useState('url');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Set preview URL for URL input
    if (url && (url.startsWith('http') || url.startsWith('https'))) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleInsert = () => {
    let finalUrl = '';
    
    if (activeTab === 'url' && imageUrl) {
      finalUrl = imageUrl;
    } else if (activeTab === 'upload' && imageFile) {
      // For now, use the data URL. In production, you'd upload to cloud storage
      finalUrl = previewUrl;
    }
    
    if (finalUrl) {
      onInsert(finalUrl, altText || 'Image');
      handleClose();
    }
  };

  const handleClose = () => {
    setImageUrl('');
    setImageFile(null);
    setAltText('');
    setPreviewUrl('');
    setActiveTab('url');
    onClose();
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('http') || url.startsWith('https');
    } catch {
      return false;
    }
  };

  const canInsert = (activeTab === 'url' && imageUrl && isValidUrl(imageUrl)) || 
                   (activeTab === 'upload' && imageFile);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Insert Image
          </DialogTitle>
          <DialogDescription>
            Add an image to your post by URL or file upload
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Custom Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'url'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Link className="w-4 h-4" />
              Image URL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  Enter a direct link to an image (JPG, PNG, GIF, WebP)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="imageFile" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        Click to upload image
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF, WebP up to 10MB
                      </span>
                    </div>
                  </label>
                  {imageFile && (
                    <div className="mt-3 text-sm text-green-600">
                      Selected: {imageFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Alt Text Input */}
          <div className="space-y-2">
            <label htmlFor="altText" className="block text-sm font-medium text-gray-700">
              Alt Text (Optional)
            </label>
            <Input
              id="altText"
              placeholder="Describe the image for accessibility"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Helps screen readers and improves SEO
            </p>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Preview</label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-40 mx-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setPreviewUrl('');
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {previewUrl && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                Image ready
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleInsert} 
              disabled={!canInsert}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Insert Image
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageInsertDialog;
