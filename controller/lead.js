const { json } = require("express");
const { postLeadToZohoCRM, updateLeadToZohoCRM } = require("../utils/leadHelper.js");
const Queue = require('bull');


const leadUpdateQueue = new Queue('leadUpdateQueue');

leadUpdateQueue.process(async (job) => {
    const updatedLead = job.data;
    console.log(`Lead Update Log ${JSON.stringify(updatedLead)}`);
    await updateLeadToZohoCRM(updatedLead);
});


exports.updateLeadToCRM = async (req, res) => {
    try {
        const updatedLead = req.body;
        console.log(`Req start`);
        leadUpdateQueue.add(updatedLead);
        res.status(200).send('Lead update request received successfully');
    } catch (error) {
        console.log('Error processing webhook request for Lead:', error);
        res.status(200).json({ message: 'Error processing update webhook request', error: error.message });
    }
};

leadUpdateQueue.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed with error ${err.message}`);
});


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
