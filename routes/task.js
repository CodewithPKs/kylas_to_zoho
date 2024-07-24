const express = require("express");
const { postTaskToCRM, updateTaskToCRM, getTask } = require("../controller/task");

const router = express.Router();

router.post('/kylas-Tasks', postTaskToCRM);

router.post('/kylas-Tasks-update', updateTaskToCRM);

router.get('/get-task', getTask);

module.exports = router;
