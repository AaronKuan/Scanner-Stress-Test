import { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { calculateProcessDelay, formatPickupNumber, getRandomInt } from '../utils/random';

interface SimulationControls {
  isRunning: boolean;
  currentOrder: Order | null;
  toggleSimulation: () => void;
}

export const useRestaurantSimulation = (): SimulationControls => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  // Track the next pickup number persistently across re-renders
  const nextPickupNumberRef = useRef<number>(0);
  
  // Initialize random start number once on mount
  useEffect(() => {
    nextPickupNumberRef.current = getRandomInt(188, 9999);
  }, []);

  useEffect(() => {
    // If simulation is paused, do nothing and clean up any timers via return
    if (!isRunning) return;

    let timeoutId: number;

    const runStateMachine = () => {
      // STATE 1: No Order -> Generate New Order (Status 2)
      if (!currentOrder) {
        const num = nextPickupNumberRef.current;
        
        // Prepare next number for the future
        let nextNum = num + 1;
        if (nextNum > 9999) nextNum = 1;
        nextPickupNumberRef.current = nextNum;

        const newOrder: Order = {
          id: crypto.randomUUID(),
          pickupNumber: formatPickupNumber(num),
          status: OrderStatus.COOKING,
          createdAt: Date.now()
        };
        
        console.log(`[Sim] Generating Order ${newOrder.pickupNumber} (Status 2)`);
        // Immediate update, no delay required for generation itself
        setCurrentOrder(newOrder);
        return;
      }

      // STATE 2: Cooking (2) -> Ready (3)
      if (currentOrder.status === OrderStatus.COOKING) {
        const delay = calculateProcessDelay();
        console.log(`[Sim] Order ${currentOrder.pickupNumber}: Status 2. Waiting ${delay}ms...`);
        
        timeoutId = window.setTimeout(() => {
          console.log(`[Sim] Order ${currentOrder.pickupNumber}: Transitioning to Status 3`);
          setCurrentOrder(prev => prev ? { ...prev, status: OrderStatus.READY } : null);
        }, delay);
        return;
      }

      // STATE 3: Ready (3) -> Completed (0)
      if (currentOrder.status === OrderStatus.READY) {
        const delay = calculateProcessDelay();
        console.log(`[Sim] Order ${currentOrder.pickupNumber}: Status 3. Waiting ${delay}ms...`);

        timeoutId = window.setTimeout(() => {
          console.log(`[Sim] Order ${currentOrder.pickupNumber}: Transitioning to Status 0`);
          setCurrentOrder(prev => prev ? { ...prev, status: OrderStatus.COMPLETED } : null);
        }, delay);
        return;
      }

      // STATE 4: Completed (0) -> Clear Screen (Null)
      if (currentOrder.status === OrderStatus.COMPLETED) {
        console.log(`[Sim] Order ${currentOrder.pickupNumber}: Status 0. Waiting 5000ms cleanup...`);
        
        timeoutId = window.setTimeout(() => {
          console.log(`[Sim] Clearing screen for next order`);
          setCurrentOrder(null); // This triggers the cycle to restart at STATE 1
        }, 5000);
        return;
      }
    };

    runStateMachine();

    // Cleanup function: Ensures timers are cancelled if state changes (re-render) or simulation stops
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isRunning, currentOrder]); // Re-run effect whenever state changes

  const toggleSimulation = () => {
    setIsRunning(prev => {
      const newState = !prev;
      console.log(newState ? "[Sim] STARTING" : "[Sim] STOPPING");
      if (!newState) {
        setCurrentOrder(null); // Reset when stopped
      }
      return newState;
    });
  };

  return {
    isRunning,
    currentOrder,
    toggleSimulation
  };
};