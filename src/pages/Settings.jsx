import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';
import toast from 'react-hot-toast';

const { FiSettings, FiKey, FiLink, FiTrash2, FiExternalLink, FiEye, FiEyeOff } = FiIcons;

const Settings = () => {
  const { 
    credentials, 
    setTrelloCredentials, 
    connected, 
    loading, 
    disconnect, 
    validateConnection 
  } = useTrello();
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      apiKey: credentials?.apiKey || '',
      token: credentials?.token || ''
    }
  });

  const onSubmit = async (data) => {
    setIsValidating(true);
    
    try {
      const newCredentials = {
        apiKey: data.apiKey.trim(),
        token: data.token.trim()
      };
      
      setTrelloCredentials(newCredentials);
      await validateConnection();
      
    } catch (error) {
      toast.error('Failed to validate credentials');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect from Trello?')) {
      disconnect();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your Trello integration</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connection Status</h2>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`font-medium ${connected ? 'text-green-700' : 'text-red-700'}`}>
                {connected ? 'Connected to Trello' : 'Not Connected'}
              </span>
            </div>
          </div>
          
          {connected && (
            <button
              onClick={handleDisconnect}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>

      {/* Credentials Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trello API Credentials</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              API Key *
            </label>
            <div className="relative">
              <input
                {...register('apiKey', { required: 'API Key is required' })}
                type={showApiKey ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your Trello API key..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showApiKey ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
            {errors.apiKey && (
              <p className="text-sm text-red-600">{errors.apiKey.message}</p>
            )}
          </div>

          {/* Token */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Token *
            </label>
            <div className="relative">
              <input
                {...register('token', { required: 'Token is required' })}
                type={showToken ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your Trello token..."
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showToken ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
            {errors.token && (
              <p className="text-sm text-red-600">{errors.token.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isValidating || loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SafeIcon icon={FiKey} className="w-5 h-5" />
            <span>
              {isValidating || loading ? 'Validating...' : 'Save & Connect'}
            </span>
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
          <SafeIcon icon={FiLink} className="w-5 h-5" />
          <span>How to Get Your Credentials</span>
        </h2>
        
        <div className="space-y-4 text-blue-800">
          <div>
            <h3 className="font-medium mb-2">1. Get Your API Key</h3>
            <p className="text-sm mb-2">
              Visit the Trello Developer Portal to get your API key:
            </p>
            <a
              href="https://trello.com/app-key"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <span>https://trello.com/app-key</span>
              <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
            </a>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">2. Generate Your Token</h3>
            <p className="text-sm">
              On the same page, click the "Token" link to generate a token with the required permissions:
            </p>
            <ul className="text-sm mt-2 space-y-1 ml-4">
              <li>• Read access to your boards and lists</li>
              <li>• Write access to create cards</li>
              <li>• Read access to your member information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <h2 className="text-lg font-semibold text-amber-900 mb-2">Security Notice</h2>
        <p className="text-amber-800 text-sm">
          Your credentials are stored locally in your browser and are only used to communicate 
          with the Trello API. They are not sent to any third-party servers.
        </p>
      </div>
    </div>
  );
};

export default Settings;