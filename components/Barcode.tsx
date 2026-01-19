import React, { useEffect, useRef } from 'react';

interface BarcodeProps {
  value: string;
  className?: string;
}

const Barcode: React.FC<BarcodeProps> = ({ 
  value, 
  className = "" 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (window.JsBarcode && svgRef.current) {
      try {
        window.JsBarcode(svgRef.current, value, {
          format: "CODE128",
          lineColor: "#000",
          width: 4, // Thicker bars for readability at distance
          height: 100, // Base height, scaled by CSS
          displayValue: false, // We render text separately
          margin: 0,
          background: "transparent"
        });
      } catch (e) {
        console.error("Barcode generation error:", e);
      }
    }
  }, [value]);

  return (
    <svg 
      ref={svgRef} 
      className={className}
      preserveAspectRatio="none"
      aria-label={`Barcode for ${value}`}
    />
  );
};

export default React.memo(Barcode);