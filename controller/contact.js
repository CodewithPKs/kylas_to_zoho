const { Postcontactzoho, updateContactToZohoCRM } = require("../utils/contactHelper.js");

exports.postContactToCRM = async (req, res) => {
    try {
        const newcontact = req.body;
        await Postcontactzoho(newcontact);
        return res.status(200).send('Contact processed successfully');
    } catch (error) {
        console.log('Error processing webhook request:', error);
        return res.status(500).send('Error processing webhook request');
    }
}

exports.updateContactToCRM = async (req, res) => {
    try {
        const updatedContact = req.body;
        await updateContactToZohoCRM(updatedContact);
        return res.status(200).send('Contact Update Successfully')
    } catch (error) {
        console.log('Error processing webhook request:', error);
        return null;
    }
}