import React from 'react';
import { SimulationEvent, OrderStatus, STATUS_LABELS } from '../types';
import Barcode from './Barcode';

interface ScannerDisplayProps {
  event: SimulationEvent;
  metrics: {
    elapsedTime: string;
    completedOrders: number;
    queueLength: number;
    isPeak: boolean;
  };
}

const ScannerDisplay: React.FC<ScannerDisplayProps> = ({ event, metrics }) => {
  const barcodeValue = `${event.pickupNumber},${event.status},`;
  const statusLabel = STATUS_LABELS[event.status];

  // Visual cues for stress levels
  const queueIsHigh = metrics.queueLength > 10;
  const queueColor = queueIsHigh ? 'text-red-600 animate-pulse' : 'text-slate-900';
  const modeBadge = metrics.isPeak 
    ? 'bg-red-600 text-white animate-pulse' 
    : 'bg-blue-600 text-white';

  return (
    <div className="h-full w-full flex flex-col justify-between p-6 pb-8 safe-area-inset-bottom">
      
      {/* --- TOP: Dashboard / HUD --- */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Time & Mode */}
        <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-3 rounded-xl border border-white/40 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Elapsed</span>
            <span className="font-mono text-2xl font-black text-slate-800 leading-none">
              {metrics.elapsedTime}
            </span>
          </div>
          <div className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm ${modeBadge}`}>
            {metrics.isPeak ? 'PEAK MODE' : 'NORMAL'}
          </div>
        </div>

        {/* Row 2: Queue & Done */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/60 backdrop-blur-md p-3 rounded-xl border border-white/40 shadow-sm flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Backlog</span>
              <span className={`text-3xl font-black leading-none ${queueColor}`}>
                {metrics.queueLength}
              </span>
           </div>
           <div className="bg-white/60 backdrop-blur-md p-3 rounded-xl border border-white/40 shadow-sm flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Completed</span>
              <span className="text-3xl font-black text-slate-800 leading-none">
                {metrics.completedOrders}
              </span>
           </div>
        </div>
      </div>

      {/* --- CENTER: Information Display --- */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 my-4">
        <span className="text-3xl sm:text-4xl font-bold text-slate-600 tracking-wider uppercase">
          {statusLabel}
        </span>
        <span className="text-[20vh] leading-none font-black text-slate-900 tracking-tighter">
          {event.pickupNumber}
        </span>
        <div className="mt-2 px-4 py-1 rounded-full bg-slate-900/5 text-slate-500 font-mono text-sm font-bold">
          Status Code: {event.status}
        </div>
      </div>

      {/* --- BOTTOM: Barcode Anchor --- */}
      <div className="w-full bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center">
        {/* Barcode takes full width, fixed height appropriate for bottom anchor */}
        <div className="w-full h-32 flex items-center justify-center overflow-hidden">
          <Barcode 
            value={barcodeValue} 
            className="w-full h-full"
          />
        </div>
      </div>

    </div>
  );
};

export default React.memo(ScannerDisplay);