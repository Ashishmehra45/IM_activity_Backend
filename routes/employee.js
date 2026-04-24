const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/EmployeAuth');

router.post('/register', employeeController.register);
router.post('/login', employeeController.login);

router.get('/my-tasks', authMiddleware, employeeController.getMyTasks);

// 2. Task ka status update karne ka route (PUT)
router.put('/update-task/:id', authMiddleware, employeeController.updateTaskStatus);


module.exports = router;