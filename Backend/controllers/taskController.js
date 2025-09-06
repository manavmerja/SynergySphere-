import { Task } from "../models/task.js"; // make sure path is correct

export const createTask = async (req, res) => {
  try {
    const UserId = req.user._id.toString();
    const { title, assignTo, tags, deadline, priority, image, description } = req.body;
    const { id: projectId } = req.params; // <-- extract the actual ID string
    console.log(projectId);
    
    // if (!title || !assignTo || !projectId) {
    //   return res.status(400).json({ message: "Required fields missing" });
    // }

    const newTask = await Task.create({
  title,
  assignTo,
  tags: tags || [],
  deadline,
  priority,
  image,
  description,
  createdBy: UserId,
  ProjectId: projectId, // <-- matches schema exactly
  status: "pending",
});


    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Task creation failed", error: err.message });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    const { id: projectId } = req.params; // extract project ID
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    
    // Fetch tasks that belong only to this project
    const tasks = await Task.find()
      .populate("assignTo", "name email") // optional: populate assignee details
      .sort({ createdAt: -1 }); // newest first
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
};
