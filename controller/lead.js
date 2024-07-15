const { json } = require("express");
const { postLeadToZohoCRM, updateLeadToZohoCRM } = require("../utils/leadHelper.js");


let leadUpdateQueue = [];
let isProcessing = false;

const processQueue = async () => {
    if (isProcessing) return;

    isProcessing = true;
    while (leadUpdateQueue.length > 0) {
        const updatedLead = leadUpdateQueue.shift();
        try {
            console.log(`Lead Update Log ${JSON.stringify(updatedLead)}`);
            await updateLeadToZohoCRM(updatedLead);
        } catch (error) {
            console.log('Error processing lead update:', error);
        }
    }
    isProcessing = false;
};


exports.updateLeadToCRM = async (req, res) => {
    try {
        const updatedLead = req.body;
        leadUpdateQueue.push(updatedLead);
        res.status(200).send('Lead update request received successfully');
        processQueue();
    } catch (error) {
        console.log('Error processing webhook request for Lead:', error);
        res.status(200).json({ message: 'Error processing update webhook request', error: error.message });
    }
};


exports.postLeadToCRM = async (req, res) => {
    try {
        const newLead = req.body;
        console.log(`New Lead Log ${newLead}`);
        await postLeadToZohoCRM(newLead);
        return res.status(200).send('Lead processed successfully');
    } catch (error) {
        console.log('Error processing webhook request:', error);
        return res.status(500).send('Error processing webhook request');
    }
}


exports.getLatestLeadUpdate = (req, res) => {
    if (latestLeadUpdate) {
        console.log(`Latest Data : ${latestLeadUpdate}`);
        res.status(200).json(latestLeadUpdate);
    } else {
        res.status(404).send('No lead update found');
    }
}
