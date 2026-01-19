import { useState, useEffect, useRef, useCallback } from 'react';
import { OrderStatus, SimulationEvent } from '../types';
import { calculateProcessDelay, formatPickupNumber, getRandomInt } from '../utils/random';

interface StressTestControls {
  isRunning: boolean;
  currentEvent: SimulationEvent | null;
  metrics: {
    elapsedTime: string;
    completedOrders: number;
    queueLength: number;
    isPeak: boolean;
  };
  toggleSimulation: () => void;
}

export const useStressTest = (): StressTestControls => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent | null>(null);
  
  // Metrics State
  const [completedCount, setCompletedCount] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const [elapsedTimeStr, setElapsedTimeStr] = useState("00:00");
  const [isPeak, setIsPeak] = useState(false);

  // Refs for logic that doesn't need immediate re-renders or mutable data
  const eventQueueRef = useRef<SimulationEvent[]>([]);
  const nextPickupNumberRef = useRef<number>(getRandomInt(188, 999));
  const startTimeRef = useRef<number>(0);
  const timeoutsRef = useRef<Set<number>>(new Set());

  // Helper to clear all pending order lifecycle timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => window.clearTimeout(id));
    timeoutsRef.current.clear();
  };

  // --------------------------------------------------------------------------
  // PRODUCER: The Kitchen (High Concurrency)
  // --------------------------------------------------------------------------
  const spawnOrderLifecycle = useCallback(() => {
    const num = nextPickupNumberRef.current;
    
    // Increment ID (wrap 9999)
    let nextNum = num + 1;
    if (nextNum > 9999) nextNum = 1;
    nextPickupNumberRef.current = nextNum;

    const pickupNumber = formatPickupNumber(num);

    // --- EVENT 1: Cooking (Immediate) ---
    eventQueueRef.current.push({
      pickupNumber,
      status: OrderStatus.COOKING,
      timestamp: Date.now()
    });

    // --- EVENT 2: Ready (Delayed 30-50s) ---
    const delayReady = calculateProcessDelay();
    const t1 = window.setTimeout(() => {
      eventQueueRef.current.push({
        pickupNumber,
        status: OrderStatus.READY,
        timestamp: Date.now()
      });
      timeoutsRef.current.delete(t1);
    }, delayReady);
    timeoutsRef.current.add(t1);

    // --- EVENT 3: Completed (Delayed another 30-50s) ---
    const delayComplete = calculateProcessDelay(); // Calculate separately for randomness
    const totalDelay = delayReady + delayComplete;
    
    const t2 = window.setTimeout(() => {
      eventQueueRef.current.push({
        pickupNumber,
        status: OrderStatus.COMPLETED,
        timestamp: Date.now()
      });
      timeoutsRef.current.delete(t2);
    }, totalDelay);
    timeoutsRef.current.add(t2);

  }, []);

  // Traffic Controller: Decides WHEN to spawn an order
  useEffect(() => {
    if (!isRunning) return;

    let trafficTimer: number;

    const scheduleNextSpawn = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      const cycleTime = elapsedSeconds % 60; // 0-60 second cycle

      // Peak Logic: Minute 50-60 (Last 10 seconds of every minute)
      const peakMode = cycleTime >= 50; 
      setIsPeak(peakMode);

      // Spawn Rate
      const delay = peakMode 
        ? getRandomInt(2000, 5000)  // Peak: 2s - 5s
        : getRandomInt(5000, 10000); // Normal: 5s - 10s

      spawnOrderLifecycle();

      trafficTimer = window.setTimeout(scheduleNextSpawn, delay);
    };

    scheduleNextSpawn();

    return () => window.clearTimeout(trafficTimer);
  }, [isRunning, spawnOrderLifecycle]);


  // --------------------------------------------------------------------------
  // CONSUMER: The Scanner Screen (Fixed Pace)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isRunning) return;

    const consumerInterval = window.setInterval(() => {
      // 1. Consume Event
      if (eventQueueRef.current.length > 0) {
        const nextEvent = eventQueueRef.current.shift();
        if (nextEvent) {
          setCurrentEvent(nextEvent);
          if (nextEvent.status === OrderStatus.COMPLETED) {
            setCompletedCount(prev => prev + 1);
          }
        }
      }

      // 2. Update Metrics (even if queue is empty)
      setQueueLength(eventQueueRef.current.length);

      const now = Date.now();
      const diff = Math.floor((now - startTimeRef.current) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsedTimeStr(`${m}:${s}`);

    }, 2000); // STRICT 2000ms Interval

    return () => window.clearInterval(consumerInterval);
  }, [isRunning]);


  // --------------------------------------------------------------------------
  // CONTROLS
  // --------------------------------------------------------------------------
  const toggleSimulation = () => {
    setIsRunning(prev => {
      const starting = !prev;
      if (starting) {
        // Start
        startTimeRef.current = Date.now();
        setCompletedCount(0);
        setElapsedTimeStr("00:00");
      } else {
        // Stop
        clearAllTimeouts();
        eventQueueRef.current = [];
        setCurrentEvent(null);
        setQueueLength(0);
        setIsPeak(false);
      }
      return starting;
    });
  };

  return {
    isRunning,
    currentEvent,
    metrics: {
      elapsedTime: elapsedTimeStr,
      completedOrders: completedCount,
      queueLength,
      isPeak
    },
    toggleSimulation
  };
};