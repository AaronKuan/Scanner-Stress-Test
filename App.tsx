import React from 'react';
import { useStressTest } from './hooks/useStressTest';
import ScannerDisplay from './components/OrderCard'; 
import { OrderStatus } from './types';

const App: React.FC = () => {
  const { isRunning, currentEvent, metrics, toggleSimulation } = useStressTest();

  // Determine background color based on status
  // Uses paler pastel colors for better contrast with the new UI
  const getBackgroundColor = () => {
    if (!currentEvent) return 'bg-slate-50';
    switch (currentEvent.status) {
      case OrderStatus.COOKING: return 'bg-amber-100'; // Yellowish
      case OrderStatus.READY: return 'bg-emerald-100';   // Greenish
      case OrderStatus.COMPLETED: return 'bg-slate-300'; // Grayish
      default: return 'bg-slate-50';
    }
  };

  return (
    <div className={`w-full h-full absolute inset-0 overflow-hidden transition-colors duration-300 ease-out ${getBackgroundColor()}`}>
      
      {/* Control Button - Discrete, Fixed Top Right */}
      <button
        onClick={toggleSimulation}
        className={`
            fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-all active:scale-95
            ${isRunning 
                ? 'bg-red-500/90 text-white hover:bg-red-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
        `}
        aria-label={isRunning ? "Stop Test" : "Start Test"}
      >
        {isRunning ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* Main Display */}
      {currentEvent ? (
        <ScannerDisplay event={currentEvent} metrics={metrics} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
              SCANNER<br/>STRESS TEST
            </h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">
              Producer-Consumer Model
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm">
             <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
               <span className="text-xs font-bold text-slate-400 uppercase">Screen Update</span>
               <span className="font-mono font-bold text-slate-700">2.0s Fixed</span>
             </div>
             <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
               <span className="text-xs font-bold text-slate-400 uppercase">Normal Traffic</span>
               <span className="font-mono font-bold text-slate-700">5s-10s</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-red-400 uppercase">Peak Traffic</span>
               <span className="font-mono font-bold text-red-600">2s-5s</span>
             </div>
          </div>
          
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Optimized for Mobile Portrait (640x1080).<br/>
            Start test to begin order generation loop.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;