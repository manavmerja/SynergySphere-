import {Project} from "../models/project.js"
export const createProject = async (req, res) => {
  try {
    const { name, description, dueDate } = req.body;
    const id = req.user._id.toString()
    console.log(id);
    
    // Make sure req.user exists from your auth middleware
    const newProject = await Project.create({
        name,
        description,
        dueDate,
        createdBy : id, // <--- THIS IS REQUIRED
    });

    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Project creation failed", errors: err.errors });
  }
};

export const getProject = async (req,res) =>{
    const id = req.user._id.toString();
    console.log(id);
    
    const projects = await Project.find({createdBy : id})
    console.log("working");
    res.json(projects)
};