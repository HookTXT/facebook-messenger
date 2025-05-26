import React, { useState } from 'react';
import { PageSelector } from '../components/facebook/PageSelector';
import { MessengerSetup } from '../components/facebook/MessengerSetup';
import { useFacebookAuth } from '../hooks/useFacebookAuth';
import { FacebookLoginButton } from '../components/facebook/FacebookLoginButton';
import MessengerDashboard from './MessengerDashboard';

/**
 * Main integration page that handles the Facebook authentication flow
 * and page selection process
 */
const FacebookIntegration: React.FC = () => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const { 
    isLoggedIn, 
    userInfo, 
    pages, 
    login, 
    logout, 
    isLoading, 
    error,
    isFBInitialized
  } = useFacebookAuth();

  // Step tracking for the integration process
  const getActiveStep = () => {
    if (!isLoggedIn) return 1;
    if (isLoggedIn && !selectedPageId) return 2;
    return 3;
  };

  const activeStep = getActiveStep();

  if (setupComplete) {
    return <MessengerDashboard />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-6">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step === activeStep 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : step < activeStep 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}>
                {step < activeStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step}</span>
                )}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${step < activeStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between">
          <div className="text-sm font-medium text-blue-600">Connect</div>
          <div className={`text-sm font-medium ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Select Page</div>
          <div className={`text-sm font-medium ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Setup Complete</div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {activeStep === 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connect your Facebook Account</h2>
          <p className="text-gray-600 mb-6">
            To get started, connect your Facebook account to allow HookTXT to access your Pages.
            We'll only request permissions needed to manage your Page conversations.
          </p>
          <FacebookLoginButton 
            onLogin={login} 
            isLoading={isLoading} 
            isFacebookInitialized={isFBInitialized} 
          />
        </div>
      )}

      {activeStep === 2 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select a Facebook Page</h2>
            <button 
              onClick={logout} 
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Switch Account
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Choose which Facebook Page you want to connect to HookTXT. You'll be able to manage
            Messenger conversations from this Page.
          </p>
          {userInfo && (
            <div className="flex items-center mb-6 p-3 bg-blue-50 rounded-lg">
              <img 
                src={userInfo.picture?.data?.url} 
                alt={userInfo.name} 
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium">{userInfo.name}</p>
                <p className="text-sm text-gray-600">{userInfo.email}</p>
              </div>
            </div>
          )}
          <PageSelector 
            pages={pages} 
            onSelectPage={(pageId) => setSelectedPageId(pageId)} 
            isLoading={isLoading}
          />
        </div>
      )}

      {activeStep === 3 && selectedPageId && (
        <MessengerSetup 
          pageId={selectedPageId} 
          onReset={() => setSelectedPageId(null)}
          onComplete={() => setSetupComplete(true)}
        />
      )}
    </div>
  );
};

export default FacebookIntegration;