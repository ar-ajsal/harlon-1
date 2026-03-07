# Virtual Jersey Try-On Integration Guide

This document details the architecture, integration steps, and capabilities of the newly added Virtual Try-On feature for Harlon.

## 🎯 Architecture Overview

The Virtual Try-On feature is built entirely **client-side** to ensure utmost privacy and lowest operational cost:
- **Framework**: Built in React (`VirtualTryOn.jsx`) using standard HTML5 Canvas, perfectly compatible with Next.js/Vite.
- **Pose Detection**: Uses lightweight `@mediapipe/pose`. The model is *lazy-loaded* via CDN only when the user clicks "Try This Jersey" and is never bundled in the main chunk.
- **Compositing**: Pure Canvas 2D API. Employs `ctx.rotate` and `ctx.translate` to correctly tilt the jersey to match the user's shoulder slopes.

## ⚙️ Features

1. **Automatic Placement & Rotate**: Using the shoulders and nose landmarks, the jersey automatically sizes to 1.4x the shoulder width, centers, and rotates matching the user's posture.
2. **"Tilt" Slider**: Complete manual overrides using X, Y, Size, and Angle (Tilt) sliders. Allows micro-adjustments for perfect fits.
3. **Debug Mode / Skeleton**: A built-in "Show AI landmarks" toggle overlays the tracked nodes (`NOSE`, `LEFT_SHOULDER`, etc.) directly on the selfie to debug and understand how the math positions the jersey.
4. **Fallback Handling**: Graceful fallback to manual sizing sliders when pose detection fails (e.g. poor lighting, blurred images).
5. **No-Upload Privacy**: Does not upload selfies to physical servers. All compositing happens dynamically inside the browser memory.

## 🛠️ Testing the Math Pipeline

Because this logic relies heavily on geometric transforms (anchoring to the nose, deriving angles from X/Y coordinates), the mathematical rules have been explicitly extracted.

### Running Automated Math Tests
The repository includes a dedicated Node.js test script to verify the math logic (e.g., verifying `X/Y/Angle` output given mocked MediaPipe coordinates).

```sh
cd frontend
node src/utils/tryonMath.test.js
```

This ensures any future improvements to the algorithm won't unintentionally break the positioning logic.

## 🎨 Admin Asset Uploading (Cloudinary Specs)

**Critical requirements for `overlayImage`:**
- **MUST** be a `.png` or `.webp` file. JPEGs `.jpg` do not support transparency and will draw a solid black background over the user.
- **MUST** use a background remover tool (like remove.bg or Apple's subject extraction) prior to uploading.
- The upload pipeline (`/backend/src/middleware/upload.js`) uses Cloudinary transforms (`flags: preserve_transparency`, `quality: 100`) specifically built to support this asset pipeline. If deploying a new CDN, maintain these alpha-channel settings.

## 🤝 Next.js / Vite Integration

The feature is currently integrated cleanly using React Lazy:
```jsx
const VirtualTryOn = lazy(() => import('../components/VirtualTryOn'))

// In your Product Detail loop:
{showTryOn && product.overlayImage && (
    <Suspense fallback={null}>
        <VirtualTryOn 
            overlayImage={product.overlayImage}
            productName={product.name}
            onClose={() => setShowTryOn(false)}
            onBuy={() => { /* ... */ }}
        />
    </Suspense>
)}
```
Because of `<Suspense>`, zero overhead is added to the product page TTI (Time to Interactive). 

## 📝 QA Checklist for Production

- [x] Does the "Try On" button hide if `tryOnEnabled` is false?
- [x] Does the MediaPipe library lazy-load? (Check network tab)
- [x] Are the X, Y, Size, and Tilt sliders behaving naturally on mobile touches?
- [x] Does the `overlayImage` respect transparent pixels on iOS Safari?
- [x] Does the math script pass natively? (`node src/utils/tryonMath.test.js`)
