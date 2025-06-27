const {query} = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { OAuth2Client } = require('google-auth-library')
const axios = require('axios')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

exports.googleAuth = async (req, res) => {
    const {token} = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        const userQuery = await query(`SELECT id_user FROM user_table WHERE email =$1`,[email])
        const checkUser = userQuery.rows.length;
        let user=''
        if(checkUser >= 1){
            user = true
        } else {
            user = false
        }
        if (!user) {
            await query(`
                INSERT INTO user_table
                (nama_lengkap, profile_picture,email)
                VALUES ($1,$2,$3)`,
            [name,picture,email])
        }
        const token_jwt = jwt.sign({
            id_user:userQuery.rows[0]?.id_user,
            email:email || null
        },process.env.JWT_SECRET)
        console.log(token_jwt);
        res.status(200).json({
            message: 'Login sukses',
            token_jwt,
        });
    } catch (err) {
        console.error('Verifikasi token gagal:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.takeUserProfile = async(req,res) =>{
    const {id_user} = req.user;
    try {
        const userData = await query(`SELECT * FROM user_table WHERE id_user = $1`,[id_user])
        if(userData.rows.length === 0){
            return res.status(404).json({
                message:"User Tidak ditemukan, silahkan login ulang"
            })
        }
        res.status(200).json({
            message:"sukses",
            data: userData.rows[0]
        })
        console.log(userData.rows[0])
    } catch (error) {
        res.status(500).json({
            message:"Internal Server Error"
        })
    }

}


exports.updateUserProfile = async(req,res) =>{
    const{nama_lengkap, nomor_telepon, alamat, device_id, kode_pos,negara, provinsi} = req.body;
    const {id_user} = req.user;

    try {
        const updatedFields={};
        if(nama_lengkap) updatedFields.nama_lengkap = nama_lengkap;
        if(nomor_telepon) updatedFields.nomor_telepon = nomor_telepon;
        if(alamat) updatedFields.alamat = alamat;
        if(device_id) updatedFields.device_id = device_id;
        if(kode_pos) updatedFields.kode_pos = kode_pos;
        if(negara) updatedFields.negara = negara;
        if(provinsi) updatedFields.provinsi = provinsi

        const setFields = Object.keys(updatedFields).map((key,index) => `${key}=$${index+1}`).join(',');
        const values = Object.values(updatedFields);

        const result = await query(`
            UPDATE user_table SET ${setFields} WHERE id_user= $${values.length + 1} RETURNING *
            `,[...values,id_user]
        )
        
        res.status(201).json({
            message:'sukses',
            data: result.rows[0]
        })
        
    } catch (error) {
        console.error("Internal Server Error", error.message);
        res.status(500).json({
            message:"Internal Server Error wkwkwk"
        })
    }
}

exports.mapping = async (req, res) => {
    const { id_device, current_url } = req.body;

    // Basic validation for input parameters
    if (!id_device || !current_url) {
        return res.status(400).json({
            message: "Bad Request: Missing required parameters"
        });
    }

    try {
        const insert = await query(`
            INSERT INTO sbc_registry (sbc_id, current_url, last_seen) 
            VALUES ($1, $2, NOW())
            ON CONFLICT (sbc_id)
            DO UPDATE SET current_url = $2, last_seen = NOW()
            RETURNING *`,
            [id_device, current_url]
        );

        // Send the result back to the client
        res.status(200).json({
            message: "SBC mapping updated successfully",
            data: insert[0]  // Assuming the query returns an array of results
        });

    } catch (error) {
        console.error("Error while updating SBC mapping:", error);
        
        // Return a more generic error message to avoid exposing internal error details
        res.status(500).json({
            message: "Internal Server Error: Something went wrong while processing your request."
        });
    }
};


exports.getAddress = async (sbc_id) => {
    try {
        const searchIdQuery = await query(`
            SELECT current_url 
            FROM sbc_registry 
            WHERE sbc_id = $1
        `, [sbc_id]);

        if (searchIdQuery.rows.length === 0) {
            console.error(`No address found for SBC ID: ${sbc_id}`);
            return null;
        }

        const { current_url } = searchIdQuery.rows[0];

        return current_url;

    } catch (error) {
        console.error("Error taking address:", error);
        return null;
    }
};

exports.sendToken = async (req, res) => {
    const { sbc_id,token_data  } = req.body;

    try {
        const current_base_url = await exports.getAddress(sbc_id);

        if (!current_base_url) {
            return res.status(404).json({
                message: `No address found for SBC ID: ${sbc_id}`
            });
        }

        const current_url = `${current_base_url}/api/receive-token`;

        const axiosResponse = await axios.post(current_url, {
            token: token_data || 'example-token-value' 
        });

        res.status(200).json({
            message: 'Token sent successfully',
            current_url: current_url,
            response_from_target: axiosResponse.data
        });


    } catch (error) {
        console.error("Error while sending token:", error);
        res.status(500).json({
            message: "Internal Server Error: Something went wrong while processing your request."
        });
    }
};

