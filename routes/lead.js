const express = require("express");
const { postLeadToCRM, updateLeadToCRM , getLatestLeadUpdate} = require("../controller/lead.js");

const router = express.Router();

router.post('/kylas-Leads', postLeadToCRM);

router.post('/kylas-Leads-update', updateLeadToCRM);

router.get('/latest-lead-update', getLatestLeadUpdate);

module.exports = router;