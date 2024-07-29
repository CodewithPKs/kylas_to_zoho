const { PostTaskzoho, updateTaskToZohoCRM } = require("../utils/taskHelper");
const db = require('../routes/firebase');


let TaskUpdateQueue = [];
let isProcessing = false;
let latestTaskUpdate = null

exports.postTaskToCRM = async (req, res) => {
    try {
        const newTask = req.body;
        const taskID = newTask.entity.id;
        const taskOwner = newTask.entity.assignedTo.name;

        console.log(`TaskID : ${taskID}, Taskowner : ${taskOwner}`);
        console.log(`Task Data : ${JSON.stringify(newTask)}`);
        await PostTaskzoho(newTask);
        await postTaskToFirebase(taskID, taskOwner);
        latestTaskUpdate = newTask;
        return res.status(200).send('Task processed successfully');
    } catch (error) {
        console.log('Error processing webhook request:', error);
        return res.status(500).send('Error processing webhook request');
    }
}


const postTaskToFirebase = async (taskID, taskOwner) => {
    console.log(`Starting postTaskToFirebase with taskID: ${taskID}, taskOwner: ${taskOwner}`);
    const taskDocRef = db.collection('Kylas Task Data').doc(taskOwner);
    const taskDoc = await taskDocRef.get();

    if (taskDoc.exists) {
        const existingData = taskDoc.data();
        const updatedStoreIDs = existingData.storeIDs ? existingData.storeIDs : [];
        console.log(`Updated storeIDs for taskOwner: ${taskOwner} before modification:`, updatedStoreIDs);

        if (!updatedStoreIDs.includes(taskID)) {
            updatedStoreIDs.push(taskID);
            console.log(`TaskID ${taskID} added to storeIDs. Updated storeIDs:`, updatedStoreIDs);
            await taskDocRef.update({ storeIDs: updatedStoreIDs });
            console.log(`Successfully updated taskOwner: ${taskOwner} with new storeIDs:`, updatedStoreIDs);
        } else {
            console.log(`TaskID ${taskID} already exists in storeIDs for taskOwner: ${taskOwner}`);
        }
    } else {
        await taskDocRef.set({ storeIDs: [taskID] });
        console.log(`Successfully created new document for taskOwner: ${taskOwner} with storeIDs: [${taskID}]`);
    }
};




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