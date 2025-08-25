import Document from "../models/document.js";

// Create new document
export const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const doc = new Document({ title, content, userId: req.user.id });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all documents for a user
export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single document
export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update with versioning
export const updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const doc = await Document.findById(req.params.id);

    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Save current state as a version before updating
    doc.versions.push({
      title: doc.title,
      content: doc.content,
    });

    doc.title = title;
    doc.content = content;

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get all versions of a document
export const getDocumentVersions = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc.versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Restore a specific version
export const restoreVersion = async (req, res) => {
  try {
    const { versionIndex } = req.params;
    const doc = await Document.findById(req.params.id);

    if (!doc) return res.status(404).json({ error: "Not found" });

    const version = doc.versions[versionIndex];
    if (!version) return res.status(400).json({ error: "Invalid version index" });

    // Save current state before restoring
    doc.versions.push({ title: doc.title, content: doc.content });

    // Restore old version
    doc.title = version.title;
    doc.content = version.content;

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
