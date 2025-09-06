import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
    createdAt : {
        type : Date,
        default : Date.now()
    },
    ProjectId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },
    title : {
        type : String,
        required : true
    },
    assignTo:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    tags : {
        type : [String],
        default : []  
    },
    deadline :{
        type: Date
    },
    priority : {
        type: String,
        enum: ['low','medium' ,'high'],
        default: 'low'
    },
    image :{
        type: String
    },
    description:{
        type : String,
        required : true  
    }
});

export const Task = mongoose.model("Task",taskSchema);