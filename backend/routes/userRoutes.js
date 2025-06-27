const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authenticate = require('../middleware/authenticate');


router.get('/infoUser',authenticate,userController.takeUserProfile);
router.post('/signUpGoogle',userController.googleAuth);
router.put('/updateProfile',authenticate,userController.updateUserProfile);
router.post('/mappingAuth',userController.mapping);

module.exports = router;