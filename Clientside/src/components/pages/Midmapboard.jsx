import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { withCredentials: true });

export default function Mindmapboard({ boardId, token }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const draggingRef = useRef(null);

  // fetch existing board
  useEffect(() => {
    const fetchBoard = async () => {
      const res = await fetch(`http://localhost:3000/api/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNodes(data.nodes || []);
      setLoading(false);
    };
    fetchBoard();
  }, [boardId, token]);

  // sockets: join & sync
  useEffect(() => {
    if (!boardId) return;
    const userId = "me"; // replace with your logged-in user id
    socket.emit("join-board", { boardId, userId });

    const onSync = (incomingNodes) => setNodes(incomingNodes);
    socket.on("nodes:sync", onSync);

    return () => {
      socket.emit("leave-board", { boardId, userId });
      socket.off("nodes:sync", onSync);
    };
  }, [boardId]);

  const addNode = () => {
    const id = crypto.randomUUID();
    const newNodes = [...nodes, { id, text: "New Node", position: { x: 80, y: 80 }, connections: [] }];
    setNodes(newNodes);
    socket.emit("nodes:update", { boardId, nodes: newNodes });
  };

  const onMouseDown = (e, id) => {
    draggingRef.current = { id, offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
  };

  const onMouseUp = () => (draggingRef.current = null);

  const onMouseMove = (e) => {
    const d = draggingRef.current;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - d.offsetX;
    const y = e.clientY - rect.top - d.offsetY;
    const newNodes = nodes.map(n => n.id === d.id ? { ...n, position: { x, y } } : n);
    setNodes(newNodes);
    socket.emit("nodes:update", { boardId, nodes: newNodes });
  };

  const save = async () => {
    await fetch(`http://localhost:3000/api/boards/${boardId}/nodes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nodes })
    });
  };

  if (loading) return <div className="mindmap">Loading…</div>;

  return (
    <div className="mindmap">
      <div className="mindmap-toolbar">
        <button onClick={addNode}>+ Node</button>
        <button onClick={save}>💾 Save</button>
      </div>

      <div
        className="mindmap-canvas"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {nodes.map(n => (
          <div
            key={n.id}
            className="mindmap-node"
            style={{ left: n.position.x, top: n.position.y }}
            onMouseDown={(e) => onMouseDown(e, n.id)}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const newNodes = nodes.map(x => x.id === n.id ? { ...x, text: e.target.innerText } : x);
              setNodes(newNodes);
              socket.emit("nodes:update", { boardId, nodes: newNodes });
            }}
          >
            {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}
