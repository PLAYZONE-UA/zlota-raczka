import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import './PhotoUpload.css'

function PhotoUpload({ photos = [], onChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const MAX_PHOTOS = 5
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  const validateFile = (file) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, GIF, WebP`)
      return false
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name}: Plik jest za duży. Maksymalny rozmiar: 5MB`)
      return false
    }

    return true
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files)

    // Check total number of photos
    if (photos.length + fileArray.length > MAX_PHOTOS) {
      toast.error(`Możesz dodać maksymalnie ${MAX_PHOTOS} zdjęć`)
      return
    }

    // Validate and process files
    const validFiles = fileArray.filter(validateFile)

    if (validFiles.length > 0) {
      const newPhotos = [...photos, ...validFiles]
      onChange(newPhotos)
      toast.success(`Dodano ${validFiles.length} zdjęć`)
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onChange(newPhotos)
    toast.info('Zdjęcie usunięte')
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="photo-upload">
      {/* Upload Area */}
      {photos.length < MAX_PHOTOS && (
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          <div className="upload-icon">📸</div>
          <p className="upload-text">
            Kliknij lub przeciągnij zdjęcia tutaj
          </p>
          <p className="upload-subtext">
            JPG, PNG, GIF, WebP (max 5MB)
          </p>
          <p className="upload-counter">
            {photos.length} / {MAX_PHOTOS} zdjęć
          </p>
        </div>
      )}

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="photo-previews">
          {photos.map((photo, index) => (
            <PhotoPreview
              key={index}
              photo={photo}
              index={index}
              onRemove={removePhoto}
            />
          ))}
        </div>
      )}

      {/* Info */}
      {photos.length === MAX_PHOTOS && (
        <div className="upload-limit-reached">
          ℹ️ Osiągnięto limit {MAX_PHOTOS} zdjęć
        </div>
      )}
    </div>
  )
}

// PhotoPreview Component
function PhotoPreview({ photo, index, onRemove }) {
  const [preview, setPreview] = useState(null)

  // Generate preview
  useEffect(() => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(photo)
  }, [photo])

  return (
    <div className="photo-preview">
      {preview ? (
        <img src={preview} alt={`Preview ${index + 1}`} className="preview-image" />
      ) : (
        <div className="preview-loading">
          <div className="spinner"></div>
        </div>
      )}

      <button
        type="button"
        className="remove-photo-btn"
        onClick={() => onRemove(index)}
        aria-label="Usuń zdjęcie"
      >
        ✕
      </button>

      <div className="photo-info">
        <span className="photo-name">{photo.name}</span>
        <span className="photo-size">
          {(photo.size / 1024 / 1024).toFixed(2)} MB
        </span>
      </div>
    </div>
  )
}

export default PhotoUpload