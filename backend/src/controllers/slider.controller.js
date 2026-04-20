import Slider from '../models/Slider.js';

// GET /api/slider — public: all active slides sorted by order
export const getSlides = async (req, res) => {
    try {
        const slides = await Slider.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
        return res.json({ success: true, slides });
    } catch (err) {
        console.error('[slider] getSlides error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/slider/all — admin: all slides including inactive
export const getAllSlides = async (req, res) => {
    try {
        const slides = await Slider.find().sort({ order: 1, createdAt: 1 }).lean();
        return res.json({ success: true, slides });
    } catch (err) {
        console.error('[slider] getAllSlides error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/slider — admin: add a new slide
export const addSlide = async (req, res) => {
    try {
        const { url, publicId, title, subtitle, link, order } = req.body;
        if (!url) return res.status(400).json({ success: false, message: 'Image URL is required' });

        const count = await Slider.countDocuments();
        const slide = await Slider.create({
            url,
            publicId: publicId || '',
            title: title || '',
            subtitle: subtitle || '',
            link: link || '/shop',
            order: order ?? count,
            active: true,
        });

        return res.status(201).json({ success: true, slide });
    } catch (err) {
        console.error('[slider] addSlide error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /api/slider/:id — admin: update slide (title, subtitle, link, active, order)
export const updateSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};
        const allowed = ['title', 'subtitle', 'link', 'active', 'order'];
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        const slide = await Slider.findByIdAndUpdate(id, updates, { new: true }).lean();
        if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });

        return res.json({ success: true, slide });
    } catch (err) {
        console.error('[slider] updateSlide error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/slider/:id — admin: remove slide
export const deleteSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const slide = await Slider.findByIdAndDelete(id).lean();
        if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });

        return res.json({ success: true, message: 'Slide deleted', publicId: slide.publicId });
    } catch (err) {
        console.error('[slider] deleteSlide error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
