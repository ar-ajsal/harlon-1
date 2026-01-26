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
                style={{
                    border: '2px dashed #e1e1e1',
                    borderRadius: '12px',
                    padding: '30px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: uploading ? '#f8f9fa' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '160px',
                    gap: '10px'
                }}
            >
                {uploading ? (
                    <>
                        <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Uploading...</p>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#f0f0f0',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '5px'
                        }}>
                            <FiUpload className="upload-icon" style={{ fontSize: '24px', color: '#666' }} />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1a1a1a' }}>Click to upload images</p>
                            <p className="upload-hint" style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                                <FiCrop style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                Auto-crop enabled
                            </p>
                        </div>
                        <p className="upload-hint" style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>JPG, PNG, WebP up to 5MB</p>
                    </>
                )}
            </label>

            {error && <p className="upload-error">{error}</p>}

            {images.length > 0 && (
                <div className="uploaded-images" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '12px',
                    marginTop: '20px'
                }}>
                    {images.map((url, index) => (
                        <div key={index} className="uploaded-image" style={{
                            position: 'relative',
                            aspectRatio: '1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #eee'
                        }}>
                            <img src={url} alt={`Upload ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => removeImage(index)}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(2px)'
                                }}
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    ))}
                    {images.length < maxImages && (
                        <label htmlFor="image-upload-input" className="add-more-btn" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            aspectRatio: '1',
                            border: '1px dashed #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#888',
                            backgroundColor: '#fcfcfc',
                            transition: 'all 0.2s'
                        }}>
                            <FiImage size={20} style={{ marginBottom: '4px' }} />
                            <span style={{ fontSize: '12px' }}>Add</span>
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
