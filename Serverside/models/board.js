// models/Board.js
import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, default: "" },
  position: {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 },
  },
  connections: [{ type: String }], // array of node IDs
}, { _id: false });

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  nodes: [nodeSchema],
}, { timestamps: true });

export default mongoose.model("Board", boardSchema);
