const express = require('express');
const router = express.Router();
const photoController = require('../controller/photoController.js');
const authenticate = require('../middleware/authenticate.js')

router.post('/uploadFotoSekarang',authenticate,photoController.uploadFotoBukti,photoController.uploadBuktiPelanggaran)
router.get('/takeuserEvidence',authenticate,photoController.userEvidence);
router.get('/takeAllEvidence',photoController.takeInfoPelanggaran);
router.get('/sumevidencesubdistrict', photoController.sumEvidenceKecamatan);
router.get('/sumevidencedistrict', photoController.sumEvidenceKabupaten);
router.get('/sumevidenceprovince', photoController.sumEvidenceProvinsi);




module.exports = router;

