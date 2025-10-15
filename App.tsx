
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { generateReunionImage } from './services/geminiService';
import { Spinner } from './components/Spinner';
import { DownloadIcon, RefreshIcon, SparklesIcon } from './components/Icons';

type AppState = 'initial' | 'loading' | 'result' | 'error';

const App: React.FC = () => {
  const [childPhoto, setChildPhoto] = useState<File | null>(null);
  const [adultPhoto, setAdultPhoto] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('initial');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    if (!childPhoto || !adultPhoto) {
      setError('Please upload both photos before generating.');
      setAppState('error');
      return;
    }

    setAppState('loading');
    setError(null);

    try {
      const resultBase64 = await generateReunionImage(childPhoto, adultPhoto);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
      setAppState('result');
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred. Please try again.'
      );
      setAppState('error');
    }
  }, [childPhoto, adultPhoto]);

  const handleReset = () => {
    setChildPhoto(null);
    setAdultPhoto(null);
    setGeneratedImage(null);
    setError(null);
    setAppState('initial');
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return (
          <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
            <Spinner />
            <h2 className="text-2xl font-semibold text-gray-700 mt-6">Creating your moment...</h2>
            <p className="text-gray-500 mt-2">This magical process can take a minute. Please wait.</p>
          </div>
        );
      case 'result':
        return (
          <div className="w-full max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Memory, Reimagined</h2>
            {generatedImage && (
              <img
                src={generatedImage}
                alt="Generated reunion"
                className="rounded-lg shadow-2xl mx-auto mb-6 border-4 border-white"
              />
            )}
            <div className="flex justify-center space-x-4">
              <a
                href={generatedImage || ''}
                download="merabuchpan_reunion.png"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
              >
                <DownloadIcon />
                Download
              </a>
              <button
                onClick={handleReset}
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300"
              >
                <RefreshIcon />
                Start Over
              </button>
            </div>
          </div>
        );
      case 'error':
        return (
           <div className="w-full max-w-lg text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Oops! </strong>
            <span className="block sm:inline">{error}</span>
            <button
                onClick={handleReset}
                className="mt-4 inline-flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors"
              >
                <RefreshIcon />
                Try Again
              </button>
          </div>
        )
      case 'initial':
      default:
        return (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <ImageUploader
                label="Your Childhood Photo"
                onFileSelect={(file) => setChildPhoto(file)}
              />
              <ImageUploader
                label="Your Recent Photo"
                onFileSelect={(file) => setAdultPhoto(file)}
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleGenerateClick}
                disabled={!childPhoto || !adultPhoto}
                className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <SparklesIcon />
                Create Magic
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <main className="container mx-auto flex flex-col items-center justify-center text-center">
        <header className="mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
            MeraBuchpan
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Reunite with your inner child. Upload two photos to create a timeless moment of you hugging your younger self.
          </p>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
