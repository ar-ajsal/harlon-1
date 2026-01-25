import { useState, useRef, useCallback } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { FiCrop, FiCheck, FiX, FiRotateCw } from 'react-icons/fi'

function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = null }) {
    const [crop, setCrop] = useState({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80
    })
    const [completedCrop, setCompletedCrop] = useState(null)
    const imgRef = useRef(null)

    const onImageLoad = useCallback((e) => {
        imgRef.current = e.currentTarget

        // Set initial crop based on aspect ratio
        const { width, height } = e.currentTarget
        let newCrop = {
            unit: '%',
            x: 10,
            y: 10,
            width: 80,
            height: 80
        }

        if (aspectRatio) {
            const aspectWidth = width * 0.8
            const aspectHeight = aspectWidth / aspectRatio

            if (aspectHeight <= height * 0.8) {
                newCrop = {
                    unit: 'px',
                    x: width * 0.1,
                    y: (height - aspectHeight) / 2,
                    width: aspectWidth,
                    height: aspectHeight
                }
            } else {
                const adjustedHeight = height * 0.8
                const adjustedWidth = adjustedHeight * aspectRatio
                newCrop = {
                    unit: 'px',
                    x: (width - adjustedWidth) / 2,
                    y: height * 0.1,
                    width: adjustedWidth,
                    height: adjustedHeight
                }
            }
        }

        setCrop(newCrop)
    }, [aspectRatio])

    const getCroppedImage = useCallback(() => {
        if (!completedCrop || !imgRef.current) {
            return null
        }

        const image = imgRef.current
        const canvas = document.createElement('canvas')
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        const pixelCrop = {
            x: completedCrop.x * scaleX,
            y: completedCrop.y * scaleY,
            width: completedCrop.width * scaleX,
            height: completedCrop.height * scaleY
        }

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
                    resolve(file)
                } else {
                    resolve(null)
                }
            }, 'image/jpeg', 0.9)
        })
    }, [completedCrop])

    const handleApplyCrop = async () => {
        const croppedFile = await getCroppedImage()
        if (croppedFile) {
            onCropComplete(croppedFile)
        }
    }

    return (
        <div className="image-cropper-modal">
            <div className="cropper-overlay" onClick={onCancel}></div>
            <div className="cropper-container">
                <div className="cropper-header">
                    <h3><FiCrop /> Crop Image</h3>
                    <p className="cropper-hint">Drag to adjust the crop area</p>
                </div>

                <div className="cropper-content">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspectRatio}
                        className="react-crop-wrapper"
                    >
                        <img
                            src={imageSrc}
                            alt="Crop preview"
                            onLoad={onImageLoad}
                            style={{ maxWidth: '100%', maxHeight: '60vh' }}
                        />
                    </ReactCrop>
                </div>

                <div className="cropper-actions">
                    <button
                        type="button"
                        className="btn btn-secondary cropper-btn"
                        onClick={onCancel}
                    >
                        <FiX /> Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary cropper-btn"
                        onClick={handleApplyCrop}
                    >
                        <FiCheck /> Apply Crop
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImageCropper
