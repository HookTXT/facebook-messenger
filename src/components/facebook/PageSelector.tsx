import React, { useState } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { FacebookPage } from '../../types/facebook';

interface PageSelectorProps {
  pages: FacebookPage[];
  onSelectPage: (pageId: string) => void;
  isLoading: boolean;
}

export const PageSelector: React.FC<PageSelectorProps> = ({ 
  pages, 
  onSelectPage,
  isLoading 
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
  };

  const handleConfirmSelection = () => {
    if (selectedPageId) {
      onSelectPage(selectedPageId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 animate-pulse h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 mb-2">No Facebook Pages found</p>
        <p className="text-sm text-gray-500">
          You need to have admin access to at least one Facebook Page to use this feature.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {pages.map(page => (
          <div
            key={page.id}
            onClick={() => handleSelectPage(page.id)}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer
              ${selectedPageId === page.id 
                ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
          >
            <div className="flex items-center">
              {page.picture && (
                <img
                  src={page.picture.data.url}
                  alt={page.name}
                  className="w-12 h-12 rounded-lg mr-3 object-cover"
                />
              )}
              <div>
                <h3 className="font-medium">{page.name}</h3>
                <p className="text-sm text-gray-600">
                  {page.category || 'Facebook Page'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {page.tasks.map(task => 
                task === 'ANALYZE' && (
                  <span key={task} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-2">
                    Messenger Enabled
                  </span>
                )
              )}
              {selectedPageId === page.id ? (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleConfirmSelection}
          disabled={!selectedPageId}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect Selected Page
        </button>
      </div>
    </div>
  );
};