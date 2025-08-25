import React, { useEffect, useState } from "react";
import MindMap from "./Midmapboard";

export default function Boards() {
  const token = localStorage.getItem("token");
  const [boards, setBoards] = useState([]);
  const [active, setActive] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3000/api/boards", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBoards(data);
    })();
  }, [token]);

  const create = async () => {
    if (!name.trim()) return;
    const res = await fetch("http://localhost:3000/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name })
    });
    const board = await res.json();
    setBoards([board, ...boards]);
    setActive(board._id);
    setName("");
  };

  if (active) {
    return <MindMap boardId={active} token={token} />;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>My Boards</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Board name" />
        <button onClick={create}>Create</button>
      </div>
      <ul>
        {boards.map(b => (
          <li key={b._id} style={{ marginBottom: 8 }}>
            <button onClick={() => setActive(b._id)}>{b.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
