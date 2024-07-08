const { json } = require("express");
const { postLeadToZohoCRM, updateLeadToZohoCRM } = require("../utils/leadHelper.js");

let latestLeadUpdate = null;

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

exports.updateLeadToCRM = async (req, res) => {
    try {
        const updatedLead = req.body;
        console.log(`Lead Update Log ${JSON.stringify(updatedLead)}`);
        latestLeadUpdate = updatedLead;
        await updateLeadToZohoCRM(updatedLead);
        res.status(200).send('Lead Update successfully');
    } catch (error) {
        console.log('Error processing webhook request for Lead :', error);
        res.status(200).json({ message: 'Error processing Update webhook request', error: error.message });
    }
}

exports.getLatestLeadUpdate = (req, res) => {
    if (latestLeadUpdate) {
        res.status(200).json(latestLeadUpdate);
    } else {
        res.status(404).send('No lead update found');
    }
}
