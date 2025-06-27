const fs = require('fs').promises;
const { Storage} = require('@google-cloud/storage')
const path = require('path');
const key = require('../secrets/coherent-window-450116-a4-ed4a9b76d13e.json')

const storage = new Storage({
    keyFilename: './secrets/coherent-window-450116-a4-ed4a9b76d13e.json'
});

const bucket = storage.bucket('travis-storage');

exports.getSignedUrlForever = async(fileName) =>{
    try {
        const file = bucket.file(fileName);
        const [url] = await file.getSignedUrl({
            action:'read',
            expires: Date.now() + 250 * 365 * 24 * 60 * 60 * 1000,
        });
        
        return(url)
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error('Failed to generate signed URL');
    }
}

exports.uploadBuktiFoto = async (files) => {
    try {
        const hasilUpload = [];

        for (const file of files) {

            const destination = `buktifoto/${Date.now()}-${file.originalname}`;

            await bucket.upload(file.path,{
                destination:destination,
            });

            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error('Error deleting local file:', err);
                } else {
                    console.log(`File ${file.path} deleted locally`);
                }
            });

            console.log(`File uploaded to ${destination}`);

            const fileUrl = await exports.getSignedUrlForever(destination);
            hasilUpload.push(fileUrl);
        }

        return hasilUpload;

    } catch (error) {
        console.error("Error di uploadBuktiFoto di controller/fileupload:", error);
        throw new Error("Error Upload Bukti Foto ke GCS");
    }
};





