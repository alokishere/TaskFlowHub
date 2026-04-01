const Document = require('../models/Document');
const { deleteFile } = require('../middleware/upload');

const uploadDocument = async (req, res, next) => {
  try {
    const { employeeId, docType } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const document = await Document.create({
      employeeId,
      docType,
      fileUrl: `public/uploads/${req.file.filename}`
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

const getEmployeeDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ employeeId: req.params.employeeId });
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    deleteFile(document.fileUrl);
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getEmployeeDocuments,
  deleteDocument
};
