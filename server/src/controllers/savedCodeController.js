const SavedCode = require('../models/SavedCode');

const saveCode = async (req, res) => {
  const { title, language, code, fileName } = req.body;
  const userId = req.user.id;

  try {
    const newCode = new SavedCode({ title, language, code, fileName, user: userId });
    await newCode.save();
    res.status(201).json({ message: 'Code saved successfully', code: newCode });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getSavedCodes = async (req, res) => {
  try {
    const codes = await SavedCode.find({ user: req.user.id });
    res.json({ codes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch saved codes', error: err.message });
  }
};

const deleteCode = async (req, res) => {
  try {
    await SavedCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Code deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete code', error: err.message });
  }
};

module.exports = { saveCode, getSavedCodes, deleteCode };
