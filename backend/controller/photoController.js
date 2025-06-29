const {query} = require('../db');
const { uploadBuktiFoto } = require('./fileUpload');
const multer = require('multer');



const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    console.log("MIME Type File: ", file.mimetype);
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);  
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);  
    }
};

const upload = multer({ 
    storage: multerStorage, 
    fileFilter: fileFilter 
});

exports.uploadFotoBukti = upload.array('bukti_foto') // commanndnya apa kalau mau uupload beberapa gambar sekaligus

exports.uploadBuktiPelanggaran = async(req,res) =>{
    const foto = req.files
    const {id_user} = req.user
    const { latitude, longitude, date } = req.body
    try {

        const upload = await uploadBuktiFoto(foto)
        const imageUrl = upload[0]
        const input = await query(`INSERT INTO foto_table (url,latitude,longitude,date, id_user) VALUES ($1, $2, $3, $4,$5) RETURNING *` ,[
          imageUrl,latitude,longitude,date,id_user
        ])
        const result = input.rows[0]
        res.status(200).json({
            message:'success',
            result

        })
    } catch (error) {
        console.error("Error ketika mencoba mengupload bukti pelanggaran",error)
        res.status(500).json({
            message:"Internal Server ERROR"
        })
    }
}


exports.takeInfoPelanggaran = async(req,res) =>{
    try {
        const dataQuery = await query (`SELECT * FROM foto_table`);

        if(dataQuery.rows < 1){
            return  res.status("Belum ada pelanggaran tercatat pada tahun ini")
        }

        const data = dataQuery.rows;

        res.status(200).json({
            message:'success',
            data
        })

    } catch (error) {
        console.error("Error ketika mencoba mengambil bukti pelanggaran",error)
        res.status(500).json({
            message:"Internal Server ERROR"
        })
    }

}

exports.userEvidence = async (req, res) => {
    const { id_user } = req.user;
    try {
        const result = await query(`
            SELECT * FROM foto_table WHERE id_user = $1
        `, [id_user]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pengguna masih belum mendapatkan bukti pelanggaran."
            });
        }

        res.status(200).json({
            message: "Bukti pelanggaran ditemukan.",
            data: result.rows
        });

    } catch (error) {
        console.error("Error mengambil bukti pelanggaran:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}
