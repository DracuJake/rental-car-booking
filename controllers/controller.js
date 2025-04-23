const Hospital = require('../models/hospital');

exports.getAllHospitals = async (req, res) => {
    try {
        let query;
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort','page','limit'];
        removeFields.forEach(param => delete reqQuery[param]);
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = Hospital.find(JSON.parse(queryStr));
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt'); // Default sort by newest
        }
        const page = parseInt(req.query.page, 10) || 1;  // ค่าเริ่มต้นหน้า 1
        const limit = parseInt(req.query.limit, 10) || 25; // ค่าเริ่มต้น 25 รายการต่อหน้า
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Hospital.countDocuments();

        query = query.skip(startIndex).limit(limit); // ใช้ skip() และ limit() สำหรับแบ่งหน้า
        const hospitals = await query;

        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                 page: page - 1,
                 limit
            };
        }

        res.status(200).json({
            success: true,
            count: hospitals.length,
            data: hospitals
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.getHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, msg: 'Hospital not found' });
        }
        res.status(200).json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.createHospital = async (req, res) => {
    try {
        console.log(req.user);
        const hospital = await Hospital.create(req.body);
        res.status(201).json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.updateHospital = async (req, res) =>{
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!hospital) {
            return res.status(404).json({ success: false, msg: 'Hospital not found' });
        }
        res.status(200).json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.deleteHospital = async (req, res) =>{
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, msg: 'Hospital not found' });
        }
        res.status(200).json({ success: true, msg: {}});
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}