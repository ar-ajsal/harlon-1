import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import { uploadApi } from '../services/api'

function ImageUploader({ images, onImagesChange, maxImages = 5 }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
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
        setUploading(true)

        try {
            // Upload each file
            const uploadPromises = files.map(async (file) => {
                const result = await uploadApi.uploadSingle(file)
                return result.url
            })

            const uploadedUrls = await Promise.all(uploadPromises)
            onImagesChange([...images, ...uploadedUrls])
        } catch (err) {
            setError('Upload failed. Please try again.')
            console.error('Upload error:', err)
        } finally {
            setUploading(false)
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
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
                multiple
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
        </div>
    )
}

export default ImageUploader
