// remittanceController.js

const Remittance = require('../models/Remittance');
const { Parser } = require('json2csv');

exports.getRemittances = async (req, res) => {
  try {
    console.log('Fetching remittances for user:', req.user._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const totalRemittances = await Remittance.countDocuments({ userId: req.user._id });
    const remittances = await Remittance.find({ userId: req.user._id })
      .sort({ startDate: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalPages = Math.ceil(totalRemittances / limit);

    console.log('Fetched remittances:', remittances);
    res.json({
      remittances,
      currentPage: page,
      totalPages,
      totalRemittances
    });
  } catch (error) {
    console.error('Error in getRemittances:', error);
    res.status(500).json({ message: 'Error fetching remittances', error: error.message });
  }
};

exports.createRemittance = async (req, res) => {
  try {
    console.log('Creating remittance. User:', req.user);
    console.log('Request body:', req.body);

    const { startDate, startTime, endTime, location } = req.body;
    
    const newRemittance = new Remittance({
      userId: req.user._id,
      startDate,
      startTime,
      endTime,
      location
    });

    const savedRemittance = await newRemittance.save();
    console.log('Remittance saved:', savedRemittance);

    res.status(201).json(savedRemittance);
  } catch (error) {
    console.error('Error creating remittance:', error);
    res.status(500).json({ message: 'Error creating remittance', error: error.message });
  }
};

exports.updateRemittance = async (req, res) => {
  try {
    console.log('Updating remittance. User:', req.user._id, 'Remittance ID:', req.params.id);
    const remittance = await Remittance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!remittance) {
      console.log('Remittance not found');
      return res.status(404).json({ message: 'Remittance not found' });
    }
    console.log('Updated remittance:', remittance);
    res.json(remittance);
  } catch (error) {
    console.error('Error updating remittance:', error);
    res.status(500).json({ message: 'Error updating remittance', error: error.message });
  }
};

exports.deleteRemittance = async (req, res) => {
  try {
    console.log('Deleting remittance. User:', req.user._id, 'Remittance ID:', req.params.id);
    const remittance = await Remittance.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!remittance) {
      console.log('Remittance not found');
      return res.status(404).json({ message: 'Remittance not found' });
    }
    console.log('Deleted remittance:', remittance);
    res.json({ message: 'Remittance deleted successfully' });
  } catch (error) {
    console.error('Error deleting remittance:', error);
    res.status(500).json({ message: 'Error deleting remittance', error: error.message });
  }
};

exports.exportRemittances = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const remittances = await Remittance.find({
      userId: req.user._id,
      startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ startDate: 1 });

    const fields = ['startDate', 'startTime', 'endTime', 'location'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(remittances);

    res.header('Content-Type', 'text/csv');
    res.attachment('remittances.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting remittances:', error);
    res.status(500).json({ message: 'Error exporting remittances', error: error.message });
  }
};