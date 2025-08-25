import Board from "../models/board.js";

export const createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Board name is required" });

    const board = await Board.create({
      name,
      description: description || "",
      createdBy: req.user._id,
      members: [req.user._id],
      nodes: [],
    });

    res.status(201).json(board);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const listBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user._id })
      .select("name description createdBy members updatedAt")
      .sort({ updatedAt: -1 });
    res.json(boards);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ error: "Board not found" });
    if (!board.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ error: "Not a member of this board" });
    }
    res.json(board);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const joinBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ error: "Board not found" });

    if (!board.members.some(m => m.equals(req.user._id))) {
      board.members.push(req.user._id);
      await board.save();
    }
    res.json(board);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Persist nodes after realtime updates (optional REST save)
export const saveNodes = async (req, res) => {
  try {
    const { id } = req.params; // boardId
    const { nodes } = req.body; // full nodes array
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ error: "Board not found" });
    if (!board.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ error: "Not a member of this board" });
    }
    board.nodes = nodes || [];
    await board.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
