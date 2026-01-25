import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage, FiCrop } from 'react-icons/fi'
import { uploadApi } from '../services/api'
import ImageCropper from './ImageCropper'

function ImageUploader({ images, onImagesChange, maxImages = 5, aspectRatio = null }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [cropperImage, setCropperImage] = useState(null)
    const [pendingFiles, setPendingFiles] = useState([])
    const [currentCropIndex, setCurrentCropIndex] = useState(0)
    const fileInputRef = useRef(null)

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        // Check max images
        if (images.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`)
            return
        }

        // Validate file types
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        const invalidFiles = files.filter(f => !validTypes.includes(f.type))
        if (invalidFiles.length > 0) {
            setError('Only JPG, PNG, WebP, GIF allowed')
            return
        }

        setError('')

        // Store files for cropping
        setPendingFiles(files)
        setCurrentCropIndex(0)

        // Start cropping the first image
        const firstFile = files[0]
        const reader = new FileReader()
        reader.onload = () => {
            setCropperImage(reader.result)
        }
        reader.readAsDataURL(firstFile)

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleCropComplete = async (croppedFile) => {
        setUploading(true)
        setCropperImage(null)

        try {
            // Upload the cropped file
            const result = await uploadApi.uploadSingle(croppedFile)
            const newImage = result.url

            // Add to images
            onImagesChange([...images, newImage])

            // Check if there are more files to crop
            const nextIndex = currentCropIndex + 1
            if (nextIndex < pendingFiles.length) {
                setCurrentCropIndex(nextIndex)
                const nextFile = pendingFiles[nextIndex]
                const reader = new FileReader()
                reader.onload = () => {
                    setCropperImage(reader.result)
                    setUploading(false)
                }
                reader.readAsDataURL(nextFile)
            } else {
                // All done
                setPendingFiles([])
                setCurrentCropIndex(0)
                setUploading(false)
            }
        } catch (err) {
            setError('Upload failed. Please try again.')
            console.error('Upload error:', err)
            setUploading(false)
            setPendingFiles([])
            setCurrentCropIndex(0)
        }
    }

    const handleCropCancel = () => {
        setCropperImage(null)

        // Check if there are more files to crop
        const nextIndex = currentCropIndex + 1
        if (nextIndex < pendingFiles.length) {
            setCurrentCropIndex(nextIndex)
            const nextFile = pendingFiles[nextIndex]
            const reader = new FileReader()
            reader.onload = () => {
                setCropperImage(reader.result)
            }
            reader.readAsDataURL(nextFile)
        } else {
            // All done
            setPendingFiles([])
            setCurrentCropIndex(0)
        }
    }

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index)
        onImagesChange(newImages)
    }

    return (
        <div className="image-uploader">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={maxImages > 1}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="image-upload-input"
            />

            <label
                htmlFor="image-upload-input"
                className={`upload-area ${uploading ? 'uploading' : ''}`}
            >
                {uploading ? (
                    <>
                        <div className="spinner" style={{ width: '30px', height: '30px' }}></div>
                        <p>Uploading...</p>
                    </>
                ) : (
                    <>
                        <FiUpload className="upload-icon" />
                        <p><strong>Tap to upload</strong></p>
                        <p className="upload-hint">
                            <FiCrop style={{ marginRight: '4px' }} />
                            Crop before upload
                        </p>
                        <p className="upload-hint">JPG, PNG, WebP up to 5MB</p>
                    </>
                )}
            </label>

            {error && <p className="upload-error">{error}</p>}

            {images.length > 0 && (
                <div className="uploaded-images">
                    {images.map((url, index) => (
                        <div key={index} className="uploaded-image">
                            <img src={url} alt={`Upload ${index + 1}`} />
                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => removeImage(index)}
                            >
                                <FiX />
                            </button>
                        </div>
                    ))}
                    {images.length < maxImages && (
                        <label htmlFor="image-upload-input" className="add-more-btn">
                            <FiImage />
                            <span>Add More</span>
                        </label>
                    )}
                </div>
            )}

            {/* Image Cropper Modal */}
            {cropperImage && (
                <ImageCropper
                    imageSrc={cropperImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspectRatio={aspectRatio}
                />
            )}

            {/* Progress indicator for multiple images */}
            {pendingFiles.length > 1 && cropperImage && (
                <div className="crop-progress">
                    Cropping image {currentCropIndex + 1} of {pendingFiles.length}
                </div>
            )}
        </div>
    )
}

export default ImageUploader
