import React, { useState, useRef } from 'react';
import { Upload, RotateCw, FileText, Loader2, Trash2 } from 'lucide-react';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultText, setResultText] = useState('');
  
  const fileInputRef = useRef(null);

  // 1. Handle File Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setRotation(0); 
        setResultText('');
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Visual Rotation (CSS only)
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // 3. The Fix: Apply Rotation via Canvas BEFORE sending to OCR
  const processImage = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setResultText('');

    try {
      // Create a new image object
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve) => (img.onload = resolve));

      // Create an off-screen canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Swap width and height if rotated 90 or 270 degrees
      if (rotation === 90 || rotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Move canvas center, rotate, and draw image
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Extract the new, permanently rotated image data
      const rotatedImageDataUrl = canvas.toDataURL('image/jpeg');

      // ===================================================================
      // INSERT YOUR OCR CODE HERE
      // Send `rotatedImageDataUrl` to Gemini or Tesseract.
      // Do NOT use `imageSrc` or the original uploaded file.
      // ===================================================================
      
      // Simulated OCR delay for demonstration (Remove this block when you add your OCR code)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResultText("This is where your extracted text will appear. Ensure you pass 'rotatedImageDataUrl' to your OCR API.");

    } catch (error) {
      console.error("Error processing image:", error);
      setResultText("Error processing image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">HKDSE Hub Scanner</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
        
        {/* Upload Area */}
        {!imageSrc ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">Click to upload an image</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            
            {/* Image Preview */}
            <div className="relative overflow-hidden bg-gray-100 rounded-lg mb-6 w-full max-w-md aspect-square flex items-center justify-center">
              <img 
                src={imageSrc} 
                alt="Preview" 
                className="max-w-full max-h-full transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }} 
              />
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleRotate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
              >
                <RotateCw className="w-5 h-5" />
                Rotate
              </button>
              
              <button 
                onClick={() => { setImageSrc(null); setRotation(0); setResultText(''); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition"
              >
                <Trash2 className="w-5 h-5" />
                Clear
              </button>

              <button 
                onClick={processImage}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                {isProcessing ? 'Processing...' : 'Extract Text'}
              </button>
            </div>
          </div>
        )}

        {/* OCR Result Area */}
        {resultText && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Extracted Text:</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[100px] whitespace-pre-wrap text-gray-700">
              {resultText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
