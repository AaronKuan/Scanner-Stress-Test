export enum OrderStatus {
  COOKING = 2, // 製作中
  READY = 3,   // 可取餐
  COMPLETED = 0 // 完成
}

export interface Order {
  id: string; // Unique internal ID
  pickupNumber: string; // 4 digits e.g. "0168"
  status: OrderStatus;
  createdAt: number;
}

export interface SimulationEvent {
  pickupNumber: string;
  status: OrderStatus;
  timestamp: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.COOKING]: "製作中",
  [OrderStatus.READY]: "可取餐",
  [OrderStatus.COMPLETED]: "完成",
};

// Global definition for the CDN JsBarcode library
declare global {
  interface Window {
    JsBarcode: (element:  HTMLElement | SVGElement | null, content: string, options?: any) => void;
  }
}