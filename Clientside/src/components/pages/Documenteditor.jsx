import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Documenteditor.css";

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [versions, setVersions] = useState([]);
  const editorRef = useRef(null);

  // Undo/Redo stacks
  const historyRef = useRef({ undo: [], redo: [] });

  // Track which formatting buttons are active
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem("token");
      axios
        .get(`http://localhost:3000/api/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setTitle(res.data.title);
          if (editorRef.current) {
            editorRef.current.innerHTML = res.data.content || "";
          }
          setVersions(res.data.versions || []);
        })
        .catch((err) => console.error("Error fetching doc:", err));
    }
  }, [id]);

  const saveDoc = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentContent = editorRef.current.innerHTML;

      const newVersion = {
        timestamp: new Date().toISOString(),
        title,
        content: currentContent,
      };

      if (id) {
        await axios.put(
          `http://localhost:3000/api/documents/${id}`,
          { title, content: currentContent, version: newVersion },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVersions([...versions, newVersion]);
      } else {
        const res = await axios.post(
          "http://localhost:3000/api/documents",
          { title, content: currentContent, version: newVersion },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate(`/editor/${res.data._id}`);
      }
      alert("Saved!");
    } catch (err) {
      console.error("Error saving doc:", err);
    }
  };

  // Handle typing (store undo history only)
  const handleChange = () => {
    const newContent = editorRef.current.innerHTML;
    historyRef.current.undo.push(newContent);
    updateActiveFormats();
  };

  // Undo
  const handleUndo = () => {
    const prev = historyRef.current.undo.pop();
    if (prev !== undefined) {
      historyRef.current.redo.push(editorRef.current.innerHTML);
      editorRef.current.innerHTML = prev;
    }
  };

  // Redo
  const handleRedo = () => {
    const next = historyRef.current.redo.pop();
    if (next !== undefined) {
      historyRef.current.undo.push(editorRef.current.innerHTML);
      editorRef.current.innerHTML = next;
    }
  };

  // Format text
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
  };

  // Track which buttons should be active
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  // Keep buttons in sync as user changes selection
  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveFormats);
    return () => {
      document.removeEventListener("selectionchange", updateActiveFormats);
    };
  }, []);

  // Restore a version
  const restoreVersion = (version) => {
    setTitle(version.title);
    editorRef.current.innerHTML = version.content;
  };

  return (
    <div className="editor-container">
      <input
        className="title-input"
        placeholder="Document Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Toolbar */}
      <div className="toolbar-actions">
        <button onClick={handleUndo} className="btn">Undo</button>
        <button onClick={handleRedo} className="btn">Redo</button>

        <button
          onClick={() => formatText("bold")}
          className={`btn ${activeFormats.bold ? "active" : ""}`}
        >
          Bold
        </button>
        <button
          onClick={() => formatText("italic")}
          className={`btn ${activeFormats.italic ? "active" : ""}`}
        >
          Italic
        </button>
        <button
          onClick={() => formatText("underline")}
          className={`btn ${activeFormats.underline ? "active" : ""}`}
        >
          Underline
        </button>
        <button
          onClick={() => formatText("insertUnorderedList")}
          className={`btn ${activeFormats.insertUnorderedList ? "active" : ""}`}
        >
          • List
        </button>
        <button
          onClick={() => formatText("insertOrderedList")}
          className={`btn ${activeFormats.insertOrderedList ? "active" : ""}`}
        >
          1. List
        </button>

        <button onClick={() => formatText("fontSize", 5)} className="btn">
          Big
        </button>

        <button onClick={saveDoc} className="btn save">Save</button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        className="text-editor"
        contentEditable
        onInput={handleChange}
      />

      {/* Version History */}
      <div className="version-history">
        <h3>Version History</h3>
        {versions.length === 0 && <p>No versions yet.</p>}
        <ul>
          {versions.map((v, i) => (
            <li key={i}>
              <span>{new Date(v.timestamp).toLocaleString()}</span>
              <button onClick={() => restoreVersion(v)}>Restore</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
