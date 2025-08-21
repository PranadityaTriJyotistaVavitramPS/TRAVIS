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

exports.uploadFotoBukti = upload.array('bukti_foto') 

exports.uploadBuktiPelanggaran = async (req, res) => {
    const foto = req.files
    const { id_user } = req.user
    let { latitude, longitude, date } = req.body

    // Konversi ke number
    latitude = parseFloat(latitude)
    longitude = parseFloat(longitude)
    date = new Date(date) // optional, kalau mau pastikan jadi date object

    console.log("latitude:", latitude, "longitude:", longitude, "timestamp:", date);

    try {
        const upload = await uploadBuktiFoto(foto)
        const imageUrl = upload[0]

        const input = await query(
          `INSERT INTO foto_table (url, latitude, longitude, date, id_user, geom)
           VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($3, $2), 4326))
           RETURNING *`,
          [imageUrl, latitude, longitude, date, id_user]
        );

        const result = input.rows[0]
        res.status(200).json({
            message: 'success',
            result
        })
    } catch (error) {
        console.error("Error ketika mencoba mengupload bukti pelanggaran", error)
        res.status(500).json({
            message: "Internal Server ERROR"
        })
    }
}

exports.takeInfoPelanggaran = async (req, res) => {
  try {
    const { level, gid, limit = 8, cursor } = req.query;
    if (!level || !gid) {
      return res.status(400).json({ message: "level dan gid wajib diisi" });
    }

    let admTable, admColumn;
    if (level === "provinsi") {
      admTable = "adm_1";
      admColumn = "gid_1";
    } else if (level === "kabupaten") {
      admTable = "adm_2";
      admColumn = "gid_2";
    } else if (level === "kecamatan") {
      admTable = "adm_3";
      admColumn = "gid_3";
    } else {
      return res.status(400).json({ message: "level tidak valid" });
    }

    let sql = `
      SELECT f.* 
      FROM foto_table f
      JOIN ${admTable} a ON ST_Contains(a.geom, f.geom)
      WHERE a.${admColumn} = $1
    `;
    const params = [gid];

    if (cursor) {
      sql += ` AND f.uploaded_at > $2 `;
      params.push(cursor);
    }

    sql += ` ORDER BY f.uploaded_at ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const dataQuery = await query(sql, params);

    const rows = dataQuery.rows;
    const nextCursor = rows.length === Number(limit) ? rows[rows.length - 1].uploaded_at : null;
    const prevCursor = rows.length > 0 ? rows[0].uploaded_at : null;

    res.status(200).json({
      message: "success",
      data: rows,
      pagination: {
        limit: Number(limit),
        nextCursor,
        prevCursor
      }
    });
  } catch (error) {
    console.error("Error ketika mencoba mengambil bukti pelanggaran", error);
    res.status(500).json({
      message: "Internal Server ERROR",
    });
  }
};

exports.sumEvidenceKecamatan = async(req, res) =>{
    try {
        const data = await query(`
            SELECT a.gid_3 as id,
           a.name_3 as name,
           COUNT(f.id_foto)::int AS count
            FROM adm_3 a
            LEFT JOIN foto_table f
            ON ST_Contains(a.geom, f.geom)
            GROUP BY a.gid_3, a.name_3
        `)

        res.status(200).json({
            message:"success",
            data:data.rows
        })
    } catch (error) {
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

exports.sumEvidenceKabupaten = async (req, res) => {
  try {
    const data = await query(`
      SELECT a.gid_2 as id,
             a.name_2 as name,
             COUNT(f.id_foto)::int AS count
      FROM adm_2 a
      LEFT JOIN foto_table f
        ON ST_Contains(a.geom, f.geom)
      GROUP BY a.gid_2, a.name_2
    `);

    res.status(200).json({ message: "success", data: data.rows });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.sumEvidenceProvinsi = async (req, res) => {
  try {
    const data = await query(`
      SELECT a.gid_1 as id,
             a.name_1 as name,
             COUNT(f.id_foto)::int AS count
      FROM adm_1 a
      LEFT JOIN foto_table f
        ON ST_Contains(a.geom, f.geom)
      GROUP BY a.gid_1, a.name_1
    `);

    res.status(200).json({ message: "success", data: data.rows });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
