const Document = require('../models/Document');
const { deleteFile, normalizeStoredPath, buildStoredUploadPath } = require('../middleware/upload');

const uploadDocument = async (req, res, next) => {
  try {
    const { employeeId, docType } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const document = await Document.create({
      employeeId,
      docType,
      fileUrl: buildStoredUploadPath(req.file.filename)
    });

    const data = document.toObject();
    data.fileUrl = normalizeStoredPath(data.fileUrl);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getEmployeeDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ employeeId: req.params.employeeId });
    const normalizedDocuments = documents.map((document) => {
      const data = document.toObject();
      data.fileUrl = normalizeStoredPath(data.fileUrl);
      return data;
    });
    res.status(200).json({ success: true, data: normalizedDocuments });
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
