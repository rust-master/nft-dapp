import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs'
import { Web3Storage, File } from 'web3.storage';

const web3StorageAPIKey = process.env.WEB3_STORAGE_API_KEY;

function makeStorageClient() {
    return new Web3Storage({ token: web3StorageAPIKey });
}

async function makeFileObjects(name, description, image) {
    const obj = { name, description, image };
    const buffer = Buffer.from(JSON.stringify(obj))

    const files = [
        new File(['contents-of-file-1'], 'plain-utf8.txt'),
        new File([buffer], 'metadata.json')
    ]
    return files
}

async function storeFiles(files) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    return cid
}

const fileFromPath = async (image, fileName) => {
    const filePath = image.tempFilePath;
    const mimeType = image.mimetype;

    const content = await fs.promises.readFile(filePath)
    const files = [
        new File(['contents-of-file-1'], mimeType),
        new File([content], fileName)
    ]
    return files
}


const web3StorageUpload = async (req, res) => {
    const { name, description } = req.body;
    const { image } = req?.files ?? {};
    console.log(`Uploading image: [${name}] to ipfs.`);
    try {
        if (!image && !name && !description || name === undefined) {
            return res.status(200).send({ message: 'invalid input' });
        }
        const imageName = `${new Date().getTime()}_${image.name.replaceAll(' ', '')}`;
        const file = await fileFromPath(image, imageName);
        const imageCid = await storeFiles(file);
        const files = await makeFileObjects(name, description, `https://${imageCid}.ipfs.w3s.link/${imageName}`);
        const metaDataCid = await storeFiles(files);
        await fs.promises.unlink(image.tempFilePath);
        const metadataUrl = `https://${metaDataCid}.ipfs.w3s.link/metadata.json`;

        const ipfsTierInfo = {
            name,
            description,
            ipfsUrl: metadataUrl,
        };
        // TODO: store metadata to db
        return res.send(ipfsTierInfo);
    } catch (error) {
        console.log(`Problem while uploading image to ipfs: ${error}`);
        return res.status(500).send({
            message: 'Problem while uploading image to ipfs'
        })
    }
}

export default {
    web3StorageUpload,
}