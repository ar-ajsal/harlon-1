import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

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
        const { search, page = 1, limit = 20 } = req.query;
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

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, total] = await Promise.all([
            Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
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
                costPrice: item.costPrice || 0, // Capture cost price
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

// Get Stats (Legacy Summary) - Keeping for compatibility if needed, but extended below
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

// GET Today's Stats for Dashboard
router.get('/stats/today', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const stats = await Order.aggregate([
            {
                $facet: {
                    today: [
                        { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$finalTotal', 0] } },
                                count: { $sum: 1 },
                                pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } }
                            }
                        }
                    ],
                    month: [
                        { $match: { date: { $gte: startOfMonth } } },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$finalTotal', 0] } },
                                profit: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ['$status', 'Paid'] }, // Only count profit for Paid orders
                                            {
                                                $subtract: [
                                                    '$subtotal', // Use subtotal (selling price * qty) for revenue part of item
                                                    {
                                                        $reduce: {
                                                            input: '$items',
                                                            initialValue: 0,
                                                            in: { $add: ['$$value', { $multiply: ['$$this.costPrice', '$$this.quantity'] }] }
                                                        }
                                                    }
                                                ]
                                            },
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    pendingTotal: [
                        { $match: { status: 'Pending' } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const result = {
            todayRevenue: stats[0].today[0]?.revenue || 0,
            todayOrders: stats[0].today[0]?.count || 0,
            monthRevenue: stats[0].month[0]?.revenue || 0,
            monthProfit: (stats[0].month[0]?.profit || 0) - (stats[0].month[0]?.discount || 0), // Basic profit calc approach
            pendingOrders: stats[0].pendingTotal[0]?.count || 0
        };

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET Monthly Report
router.get('/reports/:year/:month', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month) - 1; // JS months are 0-indexed

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const report = await Order.aggregate([
            { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    // Revenue only from PAID orders usually, or Total Booked Revenue? 
                    // Let's show "Total Sales" as finalized/paid + pending expectations if desired, 
                    // but typically Sales Report = Paid. User asked for "Total sales amount", usually implies Revenue.
                    // Let's summarize ALL orders for volume, but separate financial metrics.

                    totalRevenue: { $sum: '$finalTotal' }, // Gross booked revenue

                    paidRevenue: {
                        $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$finalTotal', 0] }
                    },

                    // Cost calculation
                    totalCost: {
                        $sum: {
                            $reduce: {
                                input: '$items',
                                initialValue: 0,
                                in: { $add: ['$$value', { $multiply: ['$$this.costPrice', '$$this.quantity'] }] }
                            }
                        }
                    },

                    ordersCount: { $sum: 1 },
                    paidCount: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } },
                    pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
                    cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } }
                }
            }
        ]);

        // Daily breakdown
        const daily = await Order.aggregate([
            { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "+05:30" } },
                    orders: { $sum: 1 },
                    sales: { $sum: '$finalTotal' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const summary = report[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            paidRevenue: 0,
            totalCost: 0,
            ordersCount: 0,
            paidCount: 0,
            pendingCount: 0,
            cancelledCount: 0
        };

        // Profit = Paid Revenue - (Cost of Goods Sold for ALL items? Or just paid items?)
        // Usually Profit is Realized Profit. Let's calculate Potential Profit vs Realized.
        // For simplicity requested: "Selling Price – Cost Price".
        // Let's return the aggregate cost we calculated.

        // Refined Profit (Revenue - Cost - Discount)
        // Note: totalRevenue already includes discount deduction.
        // So Profit = totalRevenue - totalCost.

        const summaryData = {
            ...summary,
            totalProfit: summary.totalRevenue - summary.totalCost
        };

        res.json({ success: true, data: { summary: summaryData, daily } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET invoice PDF
router.get('/:id/pdf', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Dynamic import for pdfkit (ESM)
        const PDFDocument = (await import('pdfkit')).default;
        const { businessInfo } = await import('../config/business.js');

        // Create PDF document
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.invoiceNumber}.pdf`);

        // Pipe to response
        doc.pipe(res);

        // Colors
        const primaryColor = '#1a1a2e';
        const accentColor = '#c9a962';
        const grayColor = '#666666';

        // Header - Business Info
        doc.fontSize(24).fillColor(primaryColor).font('Helvetica-Bold').text(businessInfo.name, 50, 50);
        doc.fontSize(10).fillColor(grayColor).font('Helvetica')
            .text(businessInfo.address, 50, 80)
            .text(`${businessInfo.city}`, 50, 95)
            .text(`Phone: ${businessInfo.phone}`, 50, 110);

        // Invoice Title
        doc.fontSize(28).fillColor(accentColor).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });

        // Invoice Details Box
        doc.fontSize(10).fillColor(primaryColor).font('Helvetica')
            .text(`Invoice No: ${order.invoiceNumber}`, 400, 85, { align: 'right' })
            .text(`Date: ${new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 400, 100, { align: 'right' })
            .text(`Status: ${order.status.toUpperCase()}`, 400, 115, { align: 'right' });

        // Divider
        doc.moveTo(50, 145).lineTo(545, 145).strokeColor('#e0e0e0').stroke();

        // Bill To Section
        doc.fontSize(12).fillColor(accentColor).font('Helvetica-Bold').text('BILL TO:', 50, 165);
        doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold').text(order.customer.name, 50, 185);
        doc.fontSize(10).fillColor(grayColor).font('Helvetica')
            .text(`Phone: ${order.customer.phone}`, 50, 202);
        if (order.customer.address) {
            doc.text(order.customer.address, 50, 217);
        }

        // Items Table Header
        const tableTop = 260;
        doc.rect(50, tableTop, 495, 25).fill('#f5f5f5');
        doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold')
            .text('#', 60, tableTop + 8)
            .text('Item', 85, tableTop + 8)
            .text('Qty', 330, tableTop + 8, { width: 50, align: 'center' })
            .text('Price', 390, tableTop + 8, { width: 70, align: 'right' })
            .text('Total', 470, tableTop + 8, { width: 70, align: 'right' });

        // Items
        let yPos = tableTop + 35;
        doc.font('Helvetica').fillColor(grayColor);
        order.items.forEach((item, index) => {
            doc.fontSize(10)
                .text(index + 1, 60, yPos)
                .text(item.name, 85, yPos, { width: 230 })
                .text(item.quantity, 330, yPos, { width: 50, align: 'center' })
                .text(`₹${item.price.toLocaleString('en-IN')}`, 390, yPos, { width: 70, align: 'right' })
                .text(`₹${item.total.toLocaleString('en-IN')}`, 470, yPos, { width: 70, align: 'right' });
            yPos += 25;

            // Add line separator
            doc.moveTo(50, yPos - 5).lineTo(545, yPos - 5).strokeColor('#eeeeee').stroke();
        });

        // Totals Section
        yPos += 20;
        doc.moveTo(350, yPos).lineTo(545, yPos).strokeColor('#e0e0e0').stroke();
        yPos += 15;

        doc.fontSize(10).fillColor(grayColor).font('Helvetica')
            .text('Subtotal:', 350, yPos)
            .text(`₹${order.subtotal.toLocaleString('en-IN')}`, 470, yPos, { width: 70, align: 'right' });

        if (order.discount > 0) {
            yPos += 20;
            doc.text('Discount:', 350, yPos)
                .fillColor('#27ae60').text(`-₹${order.discount.toLocaleString('en-IN')}`, 470, yPos, { width: 70, align: 'right' });
        }

        yPos += 25;
        doc.rect(350, yPos - 5, 195, 30).fill(primaryColor);
        doc.fontSize(12).fillColor('#ffffff').font('Helvetica-Bold')
            .text('TOTAL:', 360, yPos + 3)
            .text(`₹${order.finalTotal.toLocaleString('en-IN')}`, 460, yPos + 3, { width: 80, align: 'right' });

        // Payment Method & Notes
        yPos += 50;
        doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold').text('Payment Method:', 50, yPos);
        doc.font('Helvetica').fillColor(grayColor).text(order.paymentMethod, 150, yPos);

        if (order.notes) {
            yPos += 25;
            doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold').text('Notes:', 50, yPos);
            doc.font('Helvetica').fillColor(grayColor).text(order.notes, 50, yPos + 15, { width: 495 });
        }

        // Footer
        doc.fontSize(9).fillColor(grayColor).font('Helvetica')
            .text('Thank you for your business!', 50, 750, { align: 'center', width: 495 });

        // Finalize PDF
        doc.end();

    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ success: false, message: err.message });
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
                costPrice: item.costPrice || 0,
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

export default router;

