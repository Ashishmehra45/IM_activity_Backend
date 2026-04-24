const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/all', adminController.getAllEmployees);

router.get('/tasks', adminController.getAllTasks);


router.put('/approve/:id', adminController.approveEmployee);


router.delete('/reject/:id', adminController.rejectRequest);

router.post('/assign-task', adminController.assignTask);

router.get('/employee-tasks/:id', adminController.getEmployeeTasks);



module.exports = router;