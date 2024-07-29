const { PostTaskzoho, updateTaskToZohoCRM } = require("../utils/taskHelper");


let TaskUpdateQueue = [];
let isProcessing = false;
let latestTaskUpdate = null

exports.postTaskToCRM = async (req, res) => {
    try {
        const newTask = req.body;
        const taskID = newTask.entity.id;
        const taskOwner = newTask.entity.assignedTo.name;

        console.log(`TaskID : ${JSON.stringify(taskID)}, Taskowner : ${JSON.stringify(taskOwner)}`);
        console.log(`Task Data : ${JSON.stringify(newTask)}`);
        await PostTaskzoho(newTask);
        latestTaskUpdate = newTask;
        return res.status(200).send('Task processed successfully');
    } catch (error) {
        console.log('Error processing webhook request:', error);
        return res.status(500).send('Error processing webhook request');
    }
}

const processQueue = async () => {
    if (isProcessing) return;

    isProcessing = true;
    while (TaskUpdateQueue.length > 0) {
        const updatedTask = TaskUpdateQueue.shift();
        try {
            console.log(`Task Update Log ${JSON.stringify(updatedTask)}`);
            await updateTaskToZohoCRM(updatedTask);
        } catch (error) {
            console.log('Error processing Task update:', error);
        }
    }
    isProcessing = false;
};


exports.updateTaskToCRM = async (req, res) => {
    try {
        const updatedTask = req.body;
        TaskUpdateQueue.push(updatedTask);

        res.status(200).send('Task update request received successfully');
        processQueue();
    } catch (error) {
        console.log('Error processing webhook request:', error);
        return res.status(500).send('Error processing webhook request');
    }
}


exports.getTask = (req, res) => {
    if (latestTaskUpdate) {
        console.log(`Latest Data : ${latestTaskUpdate}`);
        res.status(200).json(latestTaskUpdate);
    } else {
        res.status(404).send('No task update found');
    }
}