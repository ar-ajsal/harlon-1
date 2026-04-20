import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiUpload, FiTrash2, FiEye, FiEyeOff, FiImage, FiCheck } from 'react-icons/fi'
import { sliderApi, uploadApi } from '../../services/api'

export default function SliderManager() {
    const [slides, setSlides] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [toast, setToast] = useState(null)
    const fileRef = useRef()

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const load = async () => {
        setLoading(true)
        const res = await sliderApi.getAllSlides()
        if (res.success) setSlides(res.slides)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    // Upload image → add slide
    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const upRes = await uploadApi.uploadSingle(file)
            if (!upRes.url) { showToast('Upload failed', 'error'); return }

            const addRes = await sliderApi.addSlide({ url: upRes.url, publicId: upRes.public_id || '' })
            if (addRes.success) {
                setSlides(prev => [...prev, addRes.slide])
                showToast('Slide added!')
            } else {
                showToast(addRes.message || 'Failed to add slide', 'error')
            }
        } catch (err) {
            showToast('Error uploading image', 'error')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const toggleActive = async (slide) => {
        const res = await sliderApi.updateSlide(slide._id, { active: !slide.active })
        if (res.success) setSlides(prev => prev.map(s => s._id === slide._id ? res.slide : s))
    }

    const deleteSlide = async (slide) => {
        if (!confirm('Remove this slide?')) return
        const res = await sliderApi.deleteSlide(slide._id)
        if (res.success) {
            setSlides(prev => prev.filter(s => s._id !== slide._id))
            showToast('Slide removed')
        }
    }

    const updateText = async (slide, field, value) => {
        const res = await sliderApi.updateSlide(slide._id, { [field]: value })
        if (res.success) setSlides(prev => prev.map(s => s._id === slide._id ? res.slide : s))
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f8f8', padding: '0 0 60px' }}>
            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100 }}>
                <Link to="/admin/dashboard" style={{ color: '#666', display: 'flex' }}><FiArrowLeft size={20} /></Link>
                <div>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, margin: 0 }}>Homepage Slider</h1>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', margin: 0 }}>Manage the hero banner images shown on the homepage</p>
                </div>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{
                        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
                        background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: 10,
                        padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontWeight: 700,
                        fontSize: 13, cursor: uploading ? 'wait' : 'pointer'
                    }}
                >
                    <FiUpload size={14} />
                    {uploading ? 'Uploading...' : 'Add Slide'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 9999,
                    background: toast.type === 'error' ? '#ef4444' : '#22c55e',
                    color: '#fff', padding: '12px 20px', borderRadius: 10,
                    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <FiCheck size={16} /> {toast.msg}
                </div>
            )}

            <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 20px' }}>
                {/* Info banner */}
                <div style={{
                    background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12,
                    padding: '14px 18px', marginBottom: 24,
                    fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9a3412', lineHeight: 1.6
                }}>
                    📸 <strong>Upload banner images</strong> (recommended: 1920×1080px or 16:9 ratio). They will appear as a full-screen slider on the homepage.
                    If no slides are added, the default hero design will show.
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#999', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
                ) : slides.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: '#fff', borderRadius: 16, border: '2px dashed #e5e5e5'
                    }}>
                        <FiImage size={48} color="#ccc" style={{ marginBottom: 16 }} />
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#333', margin: '0 0 8px' }}>No slides yet</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#999', margin: '0 0 20px' }}>Upload your first banner image to replace the default hero</p>
                        <button
                            onClick={() => fileRef.current?.click()}
                            style={{
                                background: 'hsl(38,65%,55%)', color: '#0a0a0a', border: 'none',
                                borderRadius: 10, padding: '12px 28px',
                                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                            }}
                        >
                            <FiUpload size={14} style={{ marginRight: 8 }} />Upload First Slide
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                        {slides.map((slide, i) => (
                            <div key={slide._id} style={{
                                background: '#fff', borderRadius: 16, border: '1px solid #eee',
                                overflow: 'hidden', display: 'flex', gap: 0,
                                opacity: slide.active ? 1 : 0.6,
                            }}>
                                {/* Preview */}
                                <div style={{ width: 200, flexShrink: 0, position: 'relative' }}>
                                    <img src={slide.url} alt="Slide" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 120 }} />
                                    <span style={{
                                        position: 'absolute', top: 8, left: 8,
                                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                                        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
                                        padding: '3px 8px', borderRadius: 6
                                    }}>#{i + 1}</span>
                                </div>

                                {/* Info + controls */}
                                <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Title (optional)</label>
                                            <input
                                                defaultValue={slide.title}
                                                onBlur={e => updateText(slide, 'title', e.target.value)}
                                                placeholder="e.g. New Drop Available"
                                                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Subtitle (optional)</label>
                                            <input
                                                defaultValue={slide.subtitle}
                                                onBlur={e => updateText(slide, 'subtitle', e.target.value)}
                                                placeholder="e.g. Limited edition retro jerseys"
                                                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>CTA Link</label>
                                        <input
                                            defaultValue={slide.link || '/shop'}
                                            onBlur={e => updateText(slide, 'link', e.target.value)}
                                            placeholder="/shop"
                                            style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e5e5', borderRadius: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        <button
                                            onClick={() => toggleActive(slide)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e5e5e5',
                                                background: slide.active ? '#f0fdf4' : '#fff', color: slide.active ? '#16a34a' : '#666',
                                                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                                            }}
                                        >
                                            {slide.active ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                                            {slide.active ? 'Visible' : 'Hidden'}
                                        </button>
                                        <button
                                            onClick={() => deleteSlide(slide)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '8px 14px', borderRadius: 8, border: '1.5px solid #fee2e2',
                                                background: '#fff5f5', color: '#ef4444',
                                                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                                            }}
                                        >
                                            <FiTrash2 size={13} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
