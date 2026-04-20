import Slider from '../models/Slider.js';
import { v2 as cloudinary } from 'cloudinary';

export const getSlides = async (req, res) => {
    try {
        const slides = await Slider.find({ active: true }).sort('order createdAt');
        res.status(200).json({ success: true, slides });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const getAllSlides = async (req, res) => {
    try {
        const slides = await Slider.find().sort('order createdAt');
        res.status(200).json({ success: true, slides });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const addSlide = async (req, res) => {
    try {
        const { url, publicId, title, subtitle, link, active, order } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, message: 'Image URL is required' });
        }

        const newSlide = new Slider({
            url,
            publicId,
            title,
            subtitle,
            link,
            active,
            order
        });

        await newSlide.save();
        res.status(201).json({ success: true, slide: newSlide });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const updateSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedSlide = await Slider.findByIdAndUpdate(id, updates, { new: true });
        
        if (!updatedSlide) {
            return res.status(404).json({ success: false, message: 'Slide not found' });
        }

        res.status(200).json({ success: true, slide: updatedSlide });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const deleteSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const slide = await Slider.findById(id);
        
        if (!slide) {
            return res.status(404).json({ success: false, message: 'Slide not found' });
        }

        // Delete from cloudinary if we have publicId
        if (slide.publicId) {
            try {
                await cloudinary.uploader.destroy(slide.publicId);
            } catch (err) {
                console.error('Failed to delete image from Cloudinary:', err);
            }
        }

        await Slider.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Slide deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
