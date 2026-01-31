const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Helper to generate next invoice number
const generateInvoiceNumber = async () => {
    const today = new Date();
    const year = today.getFullYear();

    // Find last order created this year
    const lastOrder = await Order.findOne({
        invoiceNumber: { $regex: `^INV-${year}` }
    }).sort({ createdAt: -1 });

    if (!lastOrder) {
        return `INV-${year}-001`;
    }

    // Extract sequence number
    const lastNum = parseInt(lastOrder.invoiceNumber.split('-')[2]);
    const nextNum = (lastNum + 1).toString().padStart(3, '0');

    return `INV-${year}-${nextNum}`;
};

// GET all orders
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { invoiceNumber: { $regex: search, $options: 'i' } },
                    { 'customer.name': { $regex: search, $options: 'i' } },
                    { 'customer.phone': { $regex: search, $options: 'i' } }
                ]
            };
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CREATE manual order
router.post('/', async (req, res) => {
    try {
        const { customer, items, discount, notes, paymentMethod, status } = req.body;

        // Calculate totals server-side for security
        let subtotal = 0;

        // Prepare items with snapshot data
        const orderItems = items.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return {
                product: item.product, // ID
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: itemTotal
            };
        });

        const finalTotal = subtotal - (discount || 0);

        const invoiceNumber = await generateInvoiceNumber();

        const order = new Order({
            invoiceNumber,
            customer,
            items: orderItems,
            subtotal,
            discount: discount || 0,
            finalTotal,
            notes,
            paymentMethod,
            status: status || 'Pending'
        });

        const newOrder = await order.save();
        res.status(201).json({ success: true, data: newOrder });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// UPDATE order status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// UPDATE complete order (edit invoice)
router.put('/:id', async (req, res) => {
    try {
        const { customer, items, discount, notes, paymentMethod, status } = req.body;

        // Calculate totals server-side for security
        let subtotal = 0;

        // Prepare items with snapshot data
        const orderItems = items.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return {
                product: item.product, // ID
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: itemTotal
            };
        });

        const finalTotal = subtotal - (discount || 0);

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                customer,
                items: orderItems,
                subtotal,
                discount: discount || 0,
                finalTotal,
                notes,
                paymentMethod,
                status: status || 'Pending'
            },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE order
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, message: 'Order deleted successfully', data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get Stats
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalTotal' },
                    totalOrders: { $sum: 1 },
                    paidOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] }
                    },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({ success: true, data: stats[0] || { totalRevenue: 0, totalOrders: 0, paidOrders: 0, pendingOrders: 0 } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
