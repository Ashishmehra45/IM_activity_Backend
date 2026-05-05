const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const EmployeeAuth = require('../middleware/EmployeAuth'); // EmployeeAuth middleware import karna
const checkAuth = require('../middleware/checkAuth'); // checkAuth middleware import karna

router.get('/all', adminAuth, adminController.getAllEmployees);

router.get('/tasks', adminAuth, adminController.getAllTasks);


router.put('/approve/:id', adminAuth, adminController.approveEmployee);


router.delete('/reject/:id', adminAuth, adminController.rejectRequest);

router.post('/assign-task', adminAuth, adminController.assignTask);

router.get('/employee-tasks/:id', adminAuth, adminController.getEmployeeTasks);

router.delete('/delete-task/:employeeId/:taskId', adminAuth, adminController.deleteTask);

// Route: POST /api/tasks/:id/timeline
router.post('/:id/timeline', checkAuth, adminController.updateTaskTimeline);






module.exports = router;