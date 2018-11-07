const PromiseFtp = require(`promise-ftp`);
const fs = require(`fs`);
const colors = require(`colors`);
const zlib = require('zlib')

const { ftpPassword, userName } = require(`../pw.js`);
const { stockX } = require(`./affiliateCodes.js`);

/* Download an individual data feed file from the Rakuten FTP */
const ftp = new PromiseFtp();

const ftpDownload = async (affiliate, ftpFileName) => {
  try {
    const serverMessage = await ftp.connect({
      host: `aftp.linksynergy.com`,
      user: userName,
      password: ftpPassword,
    });
    console.log(`Connected to aftp.linksynergy.com!`.green.bold)
    console.log(`Server message: ${serverMessage}`);
    const fileStream = await ftp.get(`/${stockX}/${ftpFileName}`);
    await fileStream.pipe(
      fs.createWriteStream(`${__dirname}/../ftp-downloads/${affiliate}.feed-data.xml.gz`),
    );
    console.log(`${affiliate} file saving to ftp-downloads...`.gray);
    await setTimeout(() => ftp.end(), 4000);
  } catch (err) {
    console.log(err);
    ftp.end();
  }
};

const stockXLocalName = `stockX`
const stockXFtpName = `43272_3559621_145043512_cmp.xml.gz`;

// ftpDownload(stockXLocalName, stockXFileName);

/* Unzip the gzip file after downloaded */
const unzipFile = (affiliate) => {
  const gunzip = zlib.createUnzip()
  const fileToUnzip = fs.createReadStream(`${__dirname}/../ftp-downloads/${affiliate}.feed-data.xml.gz`)
  const writeToFile = fs.createWriteStream(`${__dirname}/../ftp-downloads/${affiliate}.feed-data.xml`)
  fileToUnzip.pipe(gunzip).pipe(writeToFile)
}

// unzipFile(stockXLocalName)
