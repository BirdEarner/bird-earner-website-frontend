import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ImageCropDialog({ open, onClose, imageSrc, onCropComplete, aspectRatio = 1 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageEl, setImageEl] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (imageSrc) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setImageEl(img);
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const getCroppedImg = useCallback(() => {
    if (!imageEl || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Calculate display dimensions maintaining aspect ratio
    const imgAspect = imageEl.width / imageEl.height;
    const containerAspect = containerRect.width / containerRect.height;

    let displayWidth, displayHeight, offsetX, offsetY;
    if (imgAspect > containerAspect) {
      displayHeight = containerRect.height;
      displayWidth = displayHeight * imgAspect;
      offsetX = (containerRect.width - displayWidth) / 2;
      offsetY = 0;
    } else {
      displayWidth = containerRect.width;
      displayHeight = displayWidth / imgAspect;
      offsetX = 0;
      offsetY = (containerRect.height - displayHeight) / 2;
    }

    // Calculate crop area in image coordinates
    const scaleX = imageEl.width / displayWidth;
    const scaleY = imageEl.height / displayHeight;

    const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
    const cropX = (displayWidth - cropSize) / 2 + crop.x;
    const cropY = (displayHeight - cropSize) / 2 + crop.y;

    const sourceX = cropX * scaleX;
    const sourceY = cropY * scaleY;
    const sourceSize = cropSize * Math.min(scaleX, scaleY);

    // Set canvas size to output size
    const outputSize = 800;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.drawImage(
      imageEl,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, outputSize, outputSize
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg", quality: 0.9 });
        const url = URL.createObjectURL(blob);
        onCropComplete(file, url);
      }
    }, "image/jpeg", 0.9);
  }, [imageEl, crop, zoom, onCropComplete]);

  if (!imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative w-full h-80 bg-black rounded-lg overflow-hidden cursor-move"
          style={{ touchAction: "none" }}
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startY = e.clientY;
            const startCrop = { ...crop };

            const handleMove = (me) => {
              setCrop({
                x: startCrop.x + (me.clientX - startX),
                y: startCrop.y + (me.clientY - startY),
              });
            };
            const handleUp = () => {
              document.removeEventListener("mousemove", handleMove);
              document.removeEventListener("mouseup", handleUp);
            };
            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", handleUp);
          }}
        >
          <img
            src={imageSrc}
            alt="Crop preview"
            className="absolute top-1/2 left-1/2 max-w-full max-h-full object-contain"
            style={{
              transform: `translate(-50%, -50%) translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
            }}
            draggable={false}
          />
          {/* Crop overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute border-2 border-white border-dashed"
              style={{
                top: "10%",
                left: "10%",
                right: "10%",
                bottom: "10%",
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Zoom</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={getCroppedImg}>Apply Crop</Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
