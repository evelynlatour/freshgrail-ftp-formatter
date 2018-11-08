const PromiseFtp = require(`promise-ftp`);
const fs = require(`fs`);
const colors = require(`colors`);
const zlib = require(`zlib`);

const { ftpPassword, userName } = require(`../pw.js`);
const { stockX } = require(`./affiliateCodes.js`);
const dateForFile = new Date().toISOString().split(`T`)[0];

/* Download an individual data file from the Rakuten FTP */
const ftp = new PromiseFtp();

const ftpDownload = async (affiliateName, affiliateFtpCode, ftpFileName, date) => {
  try {
    const serverMessage = await ftp.connect({
      host: `aftp.linksynergy.com`,
      user: userName,
      password: ftpPassword,
    });
    console.log(`Connected to aftp.linksynergy.com!`.green.bold);
    console.log(`Server message: ${serverMessage}`);
    const fileStream = await ftp.get(`/${affiliateFtpCode}/${ftpFileName}`);
    return new Promise((resolve, reject) => {
      console.log(`${affiliateName} file saving to ftp-downloads...`.gray);
      fileStream.pipe(
        fs.createWriteStream(`${__dirname}/../ftp-downloads/${affiliateName}-feed_${date}.txt.gz`),
      );
      fileStream.once(`close`, resolve(ftp.end()));
      fileStream.once(`error`, reject);
    });
  } catch (err) {
    console.log(err);
    ftp.end();
  }
};

/* Unzip the gzip file after downloaded */
const unzipFile = (affiliateName, date) => {
  try {
    const gunzip = zlib.createUnzip();
    const fileToUnzip = fs.createReadStream(
      `${__dirname}/../ftp-downloads/${affiliateName}-feed_${date}.txt.gz`,
    );
    const writeToFile = fs.createWriteStream(
      `${__dirname}/../ftp-downloads/${affiliateName}-feed_${date}.txt`,
    );
    console.log(`'${affiliateName}-feed_${date}' being unzipped to ftp-downloads...`.gray);
    fileToUnzip.pipe(gunzip).pipe(writeToFile);

    // remove the gzipped file just to clean up the folder
    fs.unlink(`${__dirname}/../ftp-downloads/${affiliateName}-feed_${date}.txt.gz`, (err) => {
      if (err) throw err;
      else console.log(`gzipped file removed`.gray);
    });
  } catch (err) {
    console.log(err);
  }
};


const stockXLocalName = `stockX`;
const stockXFtpFileName = `43272_3559621_145043512_cmp.txt.gz`;


// ftpDownload(stockXLocalName, stockX, stockXFtpFileName, dateForFile);
// unzipFile(stockXLocalName, dateForFile);
