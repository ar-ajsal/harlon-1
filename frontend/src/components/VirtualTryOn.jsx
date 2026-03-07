import { useState, useRef, useCallback, useEffect } from 'react'
import '../styles/tryon.css'

/* ─── MediaPipe loader (CDN, lazy) ────────────────────────────────────────── */
let mediapipeLoaded = false
let mediapipePromise = null

function loadMediaPipe() {
    if (mediapipeLoaded) return Promise.resolve()
    if (mediapipePromise) return mediapipePromise

    mediapipePromise = new Promise((resolve, reject) => {
        const pose = document.createElement('script')
        pose.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js'
        pose.crossOrigin = 'anonymous'
        pose.onload = () => {
            mediapipeLoaded = true
            resolve()
        }
        pose.onerror = () => reject(new Error('Failed to load MediaPipe Pose'))
        document.head.appendChild(pose)
    })
    return mediapipePromise
}

/* ─── Constants ───────────────────────────────────────────────────────────── */
const STEPS = ['tips', 'input', 'processing', 'result']
// MediaPipe landmark indices
const LM = { LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_HIP: 23, RIGHT_HIP: 24 }

/* ─── VirtualTryOn ─────────────────────────────────────────────────────────── */
function VirtualTryOn({ overlayImage, productName, onClose, onBuy }) {
    const [step, setStep] = useState('tips')  // tips | input | processing | result | fallback
    const [status, setStatus] = useState('')
    const [error, setError] = useState('')

    const canvasRef = useRef(null)
    const fileInputRef = useRef(null)
    const streamRef = useRef(null)

    // Overlay placement state
    const [overlayPos, setOverlayPos] = useState({ x: 0, y: 0, scale: 1 })
    const [overlayDefaults, setOverlayDefaults] = useState({ x: 0, y: 0, scale: 1 })
    const draggingRef = useRef(false)
    const lastTouchRef = useRef(null)
    const photoRef = useRef(null)  // stores final captured ImageData / image element

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
            }
        }
    }, [])

    /* ─── Capture from camera ─────────────────────────────────────────────── */
    const handleCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
            })
            streamRef.current = stream

            // Create a hidden video to grab single frame
            const video = document.createElement('video')
            video.srcObject = stream
            video.setAttribute('playsinline', '')
            video.muted = true
            await video.play()

            // Wait for first frame to be available
            await new Promise(res => setTimeout(res, 800))

            const tmpCanvas = document.createElement('canvas')
            tmpCanvas.width = video.videoWidth || 640
            tmpCanvas.height = video.videoHeight || 640
            tmpCanvas.getContext('2d').drawImage(video, 0, 0)

            // Stop camera
            stream.getTracks().forEach(t => t.stop())
            streamRef.current = null

            const img = new Image()
            img.src = tmpCanvas.toDataURL('image/jpeg', 0.92)
            img.onload = () => processPhoto(img)
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setError('Camera permission denied. Please upload a photo instead.')
            } else {
                setError(`Camera error: ${err.message}`)
            }
        }
    }, [])

    /* ─── Upload photo ────────────────────────────────────────────────────── */
    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const img = new Image()
            img.src = ev.target.result
            img.onload = () => processPhoto(img)
        }
        reader.readAsDataURL(file)
    }, [])

    /* ─── Core: process photo with MediaPipe + draw overlay ──────────────── */
    const processPhoto = useCallback(async (photoImg) => {
        setStep('processing')
        setStatus('Loading AI model…')
        setError('')
        photoRef.current = photoImg

        try {
            await loadMediaPipe()
            setStatus('Detecting body pose…')

            // Run pose detection
            const landmarks = await detectPose(photoImg)

            if (landmarks && landmarks.length > 0) {
                setStatus('Overlaying jersey…')
                const placement = computePlacement(landmarks, photoImg.width, photoImg.height)
                await renderCanvas(photoImg, placement)
                setOverlayPos({ x: placement.x, y: placement.y, scale: placement.scale })
                setOverlayDefaults({ x: placement.x, y: placement.y, scale: placement.scale })
                setStep('result')
            } else {
                // Fallback: centre overlay manually
                const fallbackPlacement = {
                    x: photoImg.width * 0.15,
                    y: photoImg.height * 0.18,
                    scale: photoImg.width * 0.70
                }
                await renderCanvas(photoImg, fallbackPlacement)
                setOverlayPos(fallbackPlacement)
                setOverlayDefaults(fallbackPlacement)
                setStep('fallback')
            }
        } catch (err) {
            console.warn('VirtualTryOn error:', err)
            // Graceful fallback — still show canvas with manual placement
            const fallbackPlacement = {
                x: photoImg.width * 0.15,
                y: photoImg.height * 0.18,
                scale: photoImg.width * 0.70
            }
            try {
                await renderCanvas(photoImg, fallbackPlacement)
                setOverlayPos(fallbackPlacement)
                setOverlayDefaults(fallbackPlacement)
                setStep('fallback')
            } catch (e2) {
                setError('Could not process image. Please try again.')
                setStep('input')
            }
        }
    }, [overlayImage])

    /* ─── MediaPipe pose detection ────────────────────────────────────────── */
    function detectPose(photoImg) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => resolve(null), 8000)  // 8s hard timeout
            try {
                const pose = new window.Pose({
                    locateFile: (file) =>
                        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
                })
                pose.setOptions({
                    modelComplexity: 0,       // lite model — fastest on mobile
                    smoothLandmarks: false,
                    enableSegmentation: false,
                    minDetectionConfidence: 0.4,
                    minTrackingConfidence: 0.4
                })
                pose.onResults((results) => {
                    clearTimeout(timeout)
                    const lms = results.poseLandmarks || null
                    resolve(lms)
                })

                // Feed image to pose
                const offCanvas = document.createElement('canvas')
                offCanvas.width = photoImg.width
                offCanvas.height = photoImg.height
                offCanvas.getContext('2d').drawImage(photoImg, 0, 0)
                pose.send({ image: offCanvas }).catch(() => resolve(null))
            } catch (e) {
                clearTimeout(timeout)
                reject(e)
            }
        })
    }

    /* ─── Compute jersey placement from landmarks ─────────────────────────── */
    function computePlacement(landmarks, imgW, imgH) {
        const ls = landmarks[LM.LEFT_SHOULDER]
        const rs = landmarks[LM.RIGHT_SHOULDER]
        const lh = landmarks[LM.LEFT_HIP]
        const rh = landmarks[LM.RIGHT_HIP]

        if (!ls || !rs) {
            return { x: imgW * 0.15, y: imgH * 0.18, scale: imgW * 0.70 }
        }

        const lsx = ls.x * imgW, lsy = ls.y * imgH
        const rsx = rs.x * imgW, rsy = rs.y * imgH
        const lhx = lh ? lh.x * imgW : lsx + (rsx - lsx) * 0.1
        const lhy = lh ? lh.y * imgH : lsy + imgH * 0.3
        const rhx = rh ? rh.x * imgW : rsx - (rsx - lsx) * 0.1
        const rhy = rh ? rh.y * imgH : rsy + imgH * 0.3

        // Shoulder width → jersey width (add ~30% padding each side)
        const shoulderW = Math.abs(rsx - lsx)
        const jerseyW = shoulderW * 1.6
        const jerseyH = jerseyW * 1.35   // typical jersey aspect ratio

        // Center X between shoulders, Y above shoulders
        const centerX = (lsx + rsx) / 2
        const shoulderY = (lsy + rsy) / 2
        const x = centerX - jerseyW / 2
        const y = shoulderY - jerseyW * 0.12  // slight pull-up so collar aligns

        return { x, y, scale: jerseyW }
    }

    /* ─── Render canvas ───────────────────────────────────────────────────── */
    async function renderCanvas(photoImg, placement) {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.width = photoImg.width
        canvas.height = photoImg.height
        const ctx = canvas.getContext('2d')

        // Draw photo
        ctx.drawImage(photoImg, 0, 0)

        // Draw jersey overlay
        await new Promise((resolve) => {
            const jerseyImg = new Image()
            jerseyImg.crossOrigin = 'anonymous'
            jerseyImg.src = overlayImage
            jerseyImg.onload = () => {
                const jerseyW = placement.scale
                const jerseyH = (jerseyImg.naturalHeight / jerseyImg.naturalWidth) * jerseyW
                ctx.drawImage(jerseyImg, placement.x, placement.y, jerseyW, jerseyH)
                resolve()
            }
            jerseyImg.onerror = resolve   // fail silently, just show photo
        })
    }

    /* ─── Re-render canvas when sliders change ────────────────────────────── */
    const rerenderCanvas = useCallback(async (pos) => {
        if (!photoRef.current || !canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const photoImg = photoRef.current

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(photoImg, 0, 0)

        const jerseyImg = new Image()
        jerseyImg.crossOrigin = 'anonymous'
        jerseyImg.src = overlayImage
        jerseyImg.onload = () => {
            const jerseyW = pos.scale
            const jerseyH = (jerseyImg.naturalHeight / jerseyImg.naturalWidth) * jerseyW
            ctx.drawImage(jerseyImg, pos.x, pos.y, jerseyW, jerseyH)
        }
    }, [overlayImage])

    /* ─── Download ────────────────────────────────────────────────────────── */
    const handleDownload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const link = document.createElement('a')
        link.download = `harlon-tryon-${productName || 'jersey'}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    }

    /* ─── Share ───────────────────────────────────────────────────────────── */
    const handleShare = async () => {
        const canvas = canvasRef.current
        if (!canvas) return
        try {
            if (navigator.share && navigator.canShare) {
                const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
                const file = new File([blob], 'harlon-tryon.png', { type: 'image/png' })
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: `${productName || 'Jersey'} Try-On`, text: 'Check out how I look in this jersey from harlon.shop!' })
                    return
                }
            }
            // Fallback: copy page URL
            await navigator.clipboard.writeText(window.location.href)
            alert('Link copied! Paste it anywhere to share.')
        } catch (e) {
            if (e.name !== 'AbortError') {
                await navigator.clipboard.writeText(window.location.href).catch(() => { })
                alert('Link copied to clipboard!')
            }
        }
    }

    /* ─── Reset photo ─────────────────────────────────────────────────────── */
    const handleRetake = () => {
        photoRef.current = null
        setError('')
        setStep('input')
    }

    /* ─── Slider change ───────────────────────────────────────────────────── */
    const handleSliderChange = (field, value) => {
        const newPos = { ...overlayPos, [field]: Number(value) }
        setOverlayPos(newPos)
        rerenderCanvas(newPos)
    }

    /* ─── Render helpers ─────────────────────────────────────────────────── */
    const stepIndex = STEPS.indexOf(step === 'fallback' ? 'result' : step)
    const isMobile = window.innerWidth < 600

    return (
        <div className="tryon-backdrop" onMouseDown={(e) => { if (e.target.classList.contains('tryon-backdrop')) onClose() }}>
            <div className="tryon-panel" role="dialog" aria-modal="true" aria-label="Virtual Jersey Try-On">

                {/* Progress steps */}
                <div className="tryon-steps">
                    {STEPS.map((s, i) => (
                        <div key={s} className={`tryon-step-dot${i === stepIndex ? ' active' : ''}`} />
                    ))}
                </div>

                {/* Header */}
                <div className="tryon-header">
                    <div>
                        <div className="tryon-title">👕 Virtual Try-On</div>
                        <div className="tryon-subtitle">{productName || 'Jersey'}</div>
                    </div>
                    <button className="tryon-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* ── STEP 1: Tips ────────────────────────────────────────── */}
                {step === 'tips' && (
                    <div className="tryon-body">
                        <div className="tryon-instructions">
                            <span className="tryon-anim-jersey">🧥</span>
                            <h3>Try it on before you buy!</h3>
                            <p>See how this jersey looks on you using your camera or a photo.<br />Powered by on-device AI — nothing is uploaded to our servers.</p>
                        </div>

                        <div className="tryon-tips">
                            <div className="tryon-tip">
                                <span className="tryon-tip-icon">🧍</span>
                                <span>Stand straight, facing the camera</span>
                            </div>
                            <div className="tryon-tip">
                                <span className="tryon-tip-icon">💡</span>
                                <span>Good lighting gives the best result</span>
                            </div>
                            <div className="tryon-tip">
                                <span className="tryon-tip-icon">👐</span>
                                <span>Keep both shoulders visible in the frame</span>
                            </div>
                            <div className="tryon-tip">
                                <span className="tryon-tip-icon">🔒</span>
                                <span>Your photo is processed locally on your device</span>
                            </div>
                        </div>

                        <button className="tryon-btn-camera" onClick={() => setStep('input')}>
                            Let's Go! →
                        </button>
                    </div>
                )}

                {/* ── STEP 2: Input ───────────────────────────────────────── */}
                {step === 'input' && (
                    <div className="tryon-body">
                        {error && (
                            <div className="tryon-fallback-banner">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="tryon-input-options">
                            <button className="tryon-btn-camera" onClick={handleCamera}>
                                📷 Open Camera
                            </button>
                            <button
                                className="tryon-btn-upload"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                🖼️ Upload a Photo Instead
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="user"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                )}

                {/* ── STEP 3: Processing ──────────────────────────────────── */}
                {step === 'processing' && (
                    <div className="tryon-body">
                        <div className="tryon-processing">
                            <div className="tryon-spinner-wrap">
                                <div className="tryon-spinner-ring" />
                                <div className="tryon-spinner-ring-2" />
                                <div className="tryon-spinner-emoji">🧥</div>
                            </div>
                            <div className="tryon-processing-label">Fitting your jersey…</div>
                            <p>{status || 'Please wait a moment'}</p>
                        </div>
                    </div>
                )}

                {/* ── STEP 4: Result (auto-detected) ──────────────────────── */}
                {step === 'result' && (
                    <div className="tryon-body">
                        <div className="tryon-canvas-wrap">
                            <canvas ref={canvasRef} className="tryon-canvas" />
                        </div>

                        <AdjustmentControls
                            overlayPos={overlayPos}
                            overlayDefaults={overlayDefaults}
                            canvasRef={canvasRef}
                            photoImg={photoRef.current}
                            onChange={handleSliderChange}
                        />

                        <div className="tryon-canvas-hint">✨ Jersey placed automatically — adjust with sliders if needed</div>

                        <div className="tryon-actions">
                            <button className="tryon-btn-download" onClick={handleDownload}>⬇ Download</button>
                            <button className="tryon-btn-share" onClick={handleShare}>↗ Share</button>
                            <div className="tryon-actions-full">
                                <button className="tryon-btn-buy" onClick={onBuy}>🛒 Buy Now — Get This Jersey</button>
                            </div>
                        </div>

                        <div className="tryon-retake-row">
                            <button className="tryon-btn-retry" onClick={handleRetake}>↩ Try another photo</button>
                        </div>
                    </div>
                )}

                {/* ── STEP 5: Fallback (manual placement) ─────────────────── */}
                {step === 'fallback' && (
                    <div className="tryon-body">
                        <div className="tryon-fallback-banner">
                            <span>🔎</span>
                            <span>
                                Body pose not detected automatically.
                                Use the sliders below to position the jersey manually.
                            </span>
                        </div>

                        <div className="tryon-canvas-wrap">
                            <canvas ref={canvasRef} className="tryon-canvas" />
                        </div>

                        <AdjustmentControls
                            overlayPos={overlayPos}
                            overlayDefaults={overlayDefaults}
                            canvasRef={canvasRef}
                            photoImg={photoRef.current}
                            onChange={handleSliderChange}
                        />

                        <div className="tryon-actions">
                            <button className="tryon-btn-download" onClick={handleDownload}>⬇ Download</button>
                            <button className="tryon-btn-share" onClick={handleShare}>↗ Share</button>
                            <div className="tryon-actions-full">
                                <button className="tryon-btn-buy" onClick={onBuy}>🛒 Buy Now — Get This Jersey</button>
                            </div>
                        </div>

                        <div className="tryon-retake-row">
                            <button className="tryon-btn-retry" onClick={handleRetake}>↩ Try another photo</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─── Sub-component: Adjustment Controls ──────────────────────────────────── */
function AdjustmentControls({ overlayPos, overlayDefaults, onChange }) {
    const canvasW = 640  // logical reference width

    return (
        <div className="tryon-controls">
            <div className="tryon-controls-title">Adjust Jersey Position</div>

            <div className="tryon-slider-row">
                <span className="tryon-slider-label">← X →</span>
                <input
                    type="range"
                    className="tryon-slider"
                    min={-canvasW * 0.3}
                    max={canvasW * 0.7}
                    step={2}
                    value={overlayPos.x}
                    onChange={e => onChange('x', e.target.value)}
                />
                <span className="tryon-slider-val">{Math.round(overlayPos.x)}</span>
            </div>

            <div className="tryon-slider-row">
                <span className="tryon-slider-label">↑ Y ↓</span>
                <input
                    type="range"
                    className="tryon-slider"
                    min={-canvasW * 0.2}
                    max={canvasW * 0.8}
                    step={2}
                    value={overlayPos.y}
                    onChange={e => onChange('y', e.target.value)}
                />
                <span className="tryon-slider-val">{Math.round(overlayPos.y)}</span>
            </div>

            <div className="tryon-slider-row">
                <span className="tryon-slider-label">⬡ Size</span>
                <input
                    type="range"
                    className="tryon-slider"
                    min={60}
                    max={canvasW * 1.2}
                    step={4}
                    value={overlayPos.scale}
                    onChange={e => onChange('scale', e.target.value)}
                />
                <span className="tryon-slider-val">{Math.round(overlayPos.scale)}</span>
            </div>

            <button
                className="tryon-reset-btn"
                onClick={() => {
                    onChange('x', overlayDefaults.x)
                    onChange('y', overlayDefaults.y)
                    onChange('scale', overlayDefaults.scale)
                }}
            >
                Reset to auto position
            </button>
        </div>
    )
}

export default VirtualTryOn
