const express = require('express');
const router = express.Router();
const photoController = require('../controller/photoController.js');
const authenticate = require('../middleware/authenticate.js')

router.post('/uploadFotoSekarang',authenticate,photoController.uploadFotoBukti,photoController.uploadBuktiPelanggaran)
router.get('/takeAllEvidence',photoController.takeInfoPelanggaran);


module.exports = router;

