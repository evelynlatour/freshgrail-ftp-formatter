const fs = require(`fs`);
const generate = require(`csv-generate`);
const parse = require(`csv-parse`);
const { brands, squareSpaceHeaders } = require(`./utils.js`);
const colors = require(`colors`);


const readAndFilterFeed = (affiliateName, date) => {
  const data = fs.readFileSync(`${__dirname}/../ftp-downloads/${affiliateName}-feed_${date}.txt`, `utf8`);
  // create array of strings, each index = 1 product string
  // turn each product into an array, with index strings being each column (product desc categories)
  console.log(`splitting txt data...`.blue.bold);
  const arrayData = data.split(`||\n`).map(item => item.split(`|`));

  // Filter out all non shoes and non-correct brands
  console.log(`filtering shoes and correct brands...`.blue.bold);
  const shoesOnly = arrayData.filter(item => item[4] === `Shoes`);
  const correctBrands = shoesOnly.filter(item => brands.includes(item[20]));

  console.log(`length is ${correctBrands.length}`.grey);
  console.log(`removing duplicate entries...`.blue.bold);
  // Remove duplicate entries
  const duplicateCheck = [];
  const uniqueEntries = correctBrands.filter((item) => {
    if (!duplicateCheck.includes(item[19])) {
      duplicateCheck.push(item[19]);
      return true;
    }
    return false;
  });
  console.log(`length is now ${uniqueEntries.length}`.grey);
  // Note: for StockX, there is only retail price provided so no % off calculations can be done
  return uniqueEntries;
};


const transformDataFromFeed = (filteredData) => {
  // remove indexes that are not needed for squarespace content upload
  console.log(`formatting data...`.blue.bold);

  const keepIndices = [1, 9, 33, 35, 6, 13, 5]; // quasi-order for SS upload
  const removedIndices = filteredData.map((item) => {
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

  console.log(`creating product tags & urls...`.blue.bold);
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

  console.log(`sorting by price...`.blue.bold);
  // sort from highest to lowest price
  products.sort((a, b) => b[6] - a[6]);
  // take top 200
  if (products.length > 200) products.splice(199, (products.length - 200));

  /* At this point an array for each product contains the following as strings:
  [url, title, desc w/ html link, tags, categories, imageUrl, price] */
  return products;
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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
const run = (headers, affiliateName, date) => {
  const filteredData = readAndFilterFeed(affiliateName, date);
  const transformedData = transformDataFromFeed(filteredData);
  const formattedData = formatForSS(transformedData);
  const csvFile = createCSV(headers, formattedData);
  fs.writeFileSync(`${__dirname}/../square-space-uploads/${affiliateName}-SS-${date}.csv`, csvFile, `utf8`);
  console.log(`squarespace formatted CSV file saved to square-space-uploads`.bold.green);
};

const dateForFile = new Date().toISOString().split(`T`)[0];
const stockXLocalName = `stockX`;

run(squareSpaceHeaders, stockXLocalName, dateForFile);
