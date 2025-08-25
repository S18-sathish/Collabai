// routes/boardRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createBoard, listBoards, getBoard, joinBoard, saveNodes } from "../controllers/boardController.js";

const router = express.Router();

router.post("/", protect, createBoard);            // POST /api/boards
router.get("/", protect, listBoards);              // GET  /api/boards
router.get("/:id", protect, getBoard);             // GET  /api/boards/:id
router.post("/:id/join", protect, joinBoard);      // POST /api/boards/:id/join
router.put("/:id/nodes", protect, saveNodes);      // PUT  /api/boards/:id/nodes

export default router;
