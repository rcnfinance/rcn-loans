const axios = require('axios')
const fs = require('fs-extra')
const FormData = require('form-data')
const recursive = require('recursive-fs')

process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
  });

const deploy = async () => {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'

    // we gather the files from a local directory in this example, but a valid
    // readStream is all that's needed for each file in the directory.

    try {
        const response = await new Promise(resolve => {
            console.log('deploying...');
            recursive.readdirr("./dist", (_err, _dirs, files) => {
                let data = new FormData()
                files.forEach(file => {
                    data.append('file', fs.createReadStream(file), {
                        // for each file stream, we need to include the correct
                        // relative file path
                        filepath: file,
                    })
                })

                const metadata = JSON.stringify({
                    name: 'ipfsDeploy',
                });
                data.append('pinataMetadata', metadata)

                axios
                    .post(url, data, {
                        // Infinity is needed to prevent axios from erroring out with
                        // large directories
                        maxContentLength: 'Infinity',
                        headers: {
                            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                            pinata_api_key: process.env.PINATA_API_KEY,
                            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
                        },
                    })
                    .then(resolve)
            })
        })

        const pinnedHash = response.data.IpfsHash
        console.info('Deployed with hash: ', pinnedHash)
        return pinnedHash
    } catch (e) {
        console.info("Uploading to Pinata didn't work.")
        console.info(e)
        return undefined
    }
}

deploy();