import multer from 'multer';
import path from 'path';
import fs from "fs";

const UPLOADS_DIR= "./uploads";
if(!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,UPLOADS_DIR);
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
})

export const upload = multer({storage});