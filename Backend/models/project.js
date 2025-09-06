import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // ✅ Array of ObjectIds (each referencing Task)
  task: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }
  ],

  // ✅ Array of ObjectIds (each referencing User)
  teamMember: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
});

export const Projects = mongoose.model("Project", projectSchema);
