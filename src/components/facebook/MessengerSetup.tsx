import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useMessengerWebhook } from '../../hooks/useMessengerWebhook';
import { setupPageWebhook } from '../../services/facebookService';

interface MessengerSetupProps {
  pageId: string;
  onReset: () => void;
  onComplete: () => void;
}

export const MessengerSetup: React.FC<MessengerSetupProps> = ({ pageId, onReset, onComplete }) => {
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const { webhookStatus, setupWebhook } = useMessengerWebhook(pageId);

  useEffect(() => {
    const completeSetup = async () => {
      try {
        setIsSettingUp(true);
        
        // Step 1: Setup webhook subscription
        await setupWebhook();
        
        // Step 2: Configure page subscription
        await setupPageWebhook(pageId);
        
        setSetupComplete(true);
      } catch (error) {
        setSetupError(error instanceof Error ? error.message : 'Failed to set up Messenger integration');
      } finally {
        setIsSettingUp(false);
      }
    };

    completeSetup();
  }, [pageId, setupWebhook]);

  const goToMessenger = () => {
    onComplete();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Setting Up Messenger</h2>
      
      <div className="space-y-6">
        <div className="flex items-start">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3
            ${isSettingUp ? 'bg-blue-100' : webhookStatus ? 'bg-green-100' : 'bg-red-100'}`}>
            {isSettingUp ? (
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : webhookStatus ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium">Setting up webhooks</h3>
            <p className="text-sm text-gray-600">
              {isSettingUp 
                ? 'Configuring webhook to receive real-time message updates...'
                : webhookStatus 
                  ? 'Webhook successfully configured'
                  : 'Failed to set up webhook'
              }
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3
            ${isSettingUp ? 'bg-gray-100' : setupComplete ? 'bg-green-100' : 'bg-red-100'}`}>
            {isSettingUp ? (
              <span className="h-5 w-5 text-gray-400">2</span>
            ) : setupComplete ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium">Configuring Page subscription</h3>
            <p className="text-sm text-gray-600">
              {isSettingUp 
                ? 'Waiting to configure your Page...'
                : setupComplete 
                  ? 'Page successfully configured to receive messages'
                  : 'Failed to configure Page subscription'
              }
            </p>
          </div>
        </div>
      </div>

      {setupError && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
          <p className="font-medium">Setup Error</p>
          <p className="text-sm">{setupError}</p>
          <button 
            onClick={onReset}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {setupComplete && (
        <div className="mt-6 p-5 bg-green-50 rounded-lg border border-green-100 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-green-800 mb-1">Setup Complete!</h3>
          <p className="text-sm text-green-700 mb-4">
            Your Facebook Page is now connected to HookTXT. You can start managing your Messenger conversations.
          </p>
          <button
            onClick={goToMessenger}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go to Messenger Dashboard
          </button>
        </div>
      )}
    </div>
  );
};