const fs = require(`fs`);
const generate = require(`csv-generate`);
const parse = require(`csv-parse`);
const { brands, squareSpaceHeaders } = require(`./utils.js`);

const readAndFilterFeed = () => {
  const data = fs.readFileSync(`${__dirname}/../ftp-downloads/stockX.TEST.txt`, `utf8`);
  // create array of strings, each index = 1 product string
  // turn each product into an array, with index strings being each column (product desc categories)
  const arrayData = data.split(`|||U`).map(item => item.split(`|`));

  // Filter out all non shoes and non-correct brands
  const shoesOnly = arrayData.filter(item => item[4] === `Shoes`);
  const correctBrands = shoesOnly.filter(item => brands.includes(item[20]));

  // Remove duplicate entries
  const duplicateCheck = [];
  const uniqueEntries = correctBrands.filter((item) => {
    if (!duplicateCheck.includes(item[19])) {
      duplicateCheck.push(item[19]);
      return true;
    }
    return false;
  });

  // Note: for StockX, there is only retail price provided so no % off calculations can be done
  return uniqueEntries;
};

const transformDataFromFeed = () => {
  const feedData = readAndFilterFeed();
  // remove indexes that are not needed for squarespace content upload
  const keepIndices = [1, 9, 33, 35, 6, 13, 5]; // quasi-order for SS upload
  const removedIndices = feedData.map((item) => {
    const newItem = [];
    for (const indexVal of keepIndices) {
      newItem.push(item[indexVal]);
    }
    return newItem;
  });

  // filter out infant shoes
  const products = removedIndices.filter(item => !item[6].includes(`infant`));

  // create gender/age category
  products.map((item) => {
    let genderAge;
    if (item[2].includes(`male`)) genderAge = `men`;
    if (item[2].includes(`female`)) genderAge = `women`;
    if (item[2].includes(`unisex`) && item[3].includes(`adult`)) genderAge = `unisex`;
    if (item[2].includes(`unisex`) && item[3].includes(`kids`)) genderAge = `kids`;
    item.splice(2, 2, genderAge);
  });

  // Create product tags and URL
  products.map((item) => {
    const removeChars = item[0]
      .replace(/"/g, ``)
      .replace(/'/g, ``)
      .replace(/\(|\)/g, ``);

    const tags = removeChars.split(` `).join(`, `);
    const url = removeChars
      .replace(/\./g, `-`)
      .split(` `)
      .join(`-`);
    item.splice(2, 0, tags);
    item.splice(0, 0, url);
  });

  // embed put affiliate link into description & remove from array
  products.map((product) => {
    const newDesc = product[2].concat(formatLink(product[7], `StockX`));
    product[2] = newDesc;
    product.splice(7, 1); // remove link, no longer needed
    return product;
  });

  // sort from highest to lowest price
  products.sort((a, b) => b[6] - a[6]);
  // take top 200
  products.splice(0, products.length - 200))
  console.log(products);

  /* At this point an array for each product contains the following as strings:
  [url, title, desc w/ html link, tags, categories, imageUrl, price] */
  return products;
};

transformDataFromFeed();


function formatLink(link, affiliateName) {
  return `<p><h3 style="white-space: pre-wrap;"><strong>Buy now:</strong></h3></p><h3 style="white-space: pre-wrap;"><a href="${link}" target="_blank">${affiliateName}</a></h3>`;
}

// Format for squareSpace upload csv format w/ correct order of empty rows
const formatForSS = (formattedProductArray) => {
  formattedProductArray.map((product) => {
    product.splice(3, 0, `Physical`);
    product.splice(6, 0, `TRUE`);
    product.splice(8, 0, `,`, `,`, `,`, `,`, `,`, `,`, `,`);
    product.splice(16, 0, `,`, `,`, `,`, `,`, `,`, `,`);
    product.splice(22, 0, `1`);
  });

  return formattedProductArray;
};


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// Write to CSV & save file locally
const createCSV = (headers, dataset) => {
  // insert error handler in the event that the length of headers and dataset do not match

  // escape double quotes that may exist in title & description
  const escapeDescriptionQuotes = dataset.map((item) => {
    const newDesc = item[2].replace(/"/g, `""`);
    const newTitle = item[1].replace(/"/g, `""`);
    item[2] = newDesc;
    item[1] = newTitle;
    return item;
  });

  // escape commas by wrapping each string in double quotes
  const escapeCommasWithQuotes = escapeDescriptionQuotes.map(item =>
    item.map((str) => {
      if (str !== `,`) return `"${str}"`;
    }));
  return `${headers}\n${escapeCommasWithQuotes.reduce(
    (acc, curr) => acc.concat(`${curr.join(`,`).trim()}\n`),
    ``,
  )}`.trim();
};


// RUN
const run = () => {
  const productData = transformDataFromFeed();
  const formattedData = formatForSS(productData);
  const csvFile = createCSV(squareSpaceHeaders, formattedData);
  fs.writeFileSync(`${__dirname}/../square-space-uploads/stockX.SS.csv`, csvFile, `utf8`);
};

// run();
