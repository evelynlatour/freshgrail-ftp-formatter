// Load XML file
// Remove all products that are not shoes
// Remove anything not women's men's or kid's
// Remove all brands that are not those specified
// Remove duplicates (if any)

// Calculate the percentage off between sale & reg price
// Remove anything that is < 25% off

// Sort by highest sales price (sale/current) price and keep the top 200

// Create new content for tags (from title)
// Create product urls from the name (replace ',','/',''',' ' .... w/ dashes)
// Combine the long description w/ the button HTML & tracking link

const fs = require(`fs`);
const generate = require(`csv-generate`);
const parse = require(`csv-parse`);
const { brands, squareSpaceHeaders } = require(`./utils.js`);

// const result = data.replace(/['"]+/g, ``);

const filterFeed = () => {
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

const formatFeed = () => {
  const feedData = filterFeed();
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
  const formatIndices = removedIndices.filter(item => !item[6].includes(`infant`));

  // create gender/age category
  formatIndices.map((item) => {
    let genderAge;
    if (item[2].includes(`male`)) genderAge = `men`;
    if (item[2].includes(`female`)) genderAge = `women`;
    if (item[2].includes(`unisex`) && item[3].includes(`adult`)) genderAge = `unisex`;
    if (item[2].includes(`unisex`) && item[3].includes(`kids`)) genderAge = `kids`;
    item.splice(2, 2, genderAge);
  });

  // Create product tags and URL
  formatIndices.map((item) => {
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

  /* At this point an array for each product contains the following as strings:
  [url, title, desc, tags, categories, imageUrl, price, affiliate link] */
  return formatIndices;
};

// formatFeed();

const correctHeaderData = [
  [
    `Nike-React-Element-87-Undercover-Volt`,
    `Nike React Element 87 Undercover Volt`,
    `What's better than the classic 90s' TV series "New York Undercover"? Nothing really, but the Nike React Element 87 Undercover Volt is close. First unveiled by Jun Takahasi at UNDERCOVER's Paris Fashion Week's FW18 show in March, these shoes feature 'UNDERCOVER by Jun Takahasi' stamped on the translucent yellow uppers, the cork footbed has been replaced with a mesh one, and the colors coordinate with the shoes' uppers. If you love Malik Yoba, Dick Wolf, UNDERCOVER, and Nike, then these jawns are for you.`,
    `Physical`,
    `Nike, React, Element, 87, Undercover, Volt`,
    `men`,
    `TRUE`,
    `https://stockx.imgix.net/Nike-React-Element-87-Undercover-Volt-Product.jpg`,
    `,`,
    `,`,
    `,`,
    `,`,
    `,`,
    `,`,
    `,`,
    `230.00`,
    `,`,
    `,`,
    `,`,
    `,`,
    `,`,
    `,`,
    `1`,
  ],
];

const formatLink = (link, affiliateName) =>
  `<p><h3 style="white-space: pre-wrap;"><strong>Buy now:</strong></h3></p><h3 style="white-space: pre-wrap;"><a href="${link}" target="_blank">${affiliateName}</a></h3>`;

// Format for squareSpace upload csv format w/ correct headers
const formatForSS = (products) => {
  // put affiliate link into description
  const descLinks = products.map((product) => {
    const newDesc = product[2].concat(formatLink(product[7], `StockX`));
    product[2] = newDesc;
    product.splice(7, 1); // remove link, no longer needed
    return product;
  });

  // insert commas for empty rows
  descLinks.map((product) => {
    product.splice(3, 0, `Physical`);
    product.splice(6, 0, `TRUE`);
    product.splice(8, 0, `,`, `,`, `,`, `,`, `,`, `,`, `,`);
    product.splice(16, 0, `,`, `,`, `,`, `,`, `,`, `,`);
    product.splice(21, 0, `1`);
  });

  return descLinks;
};


formatForSS(exampleData);

// Write to CSV & save file locally
const createCSV = (headers, dataset) => {
  // insert error handler in the event that the length of headers and dataset do not match
  const escapeDescriptionQuotes = dataset.map((item) => {
    const newDesc = item[2].replace(/"/g, `""`);
    item[2] = newDesc;
    return item;
  });
  const escapeCommasWithQuotes = escapeDescriptionQuotes.map(item =>
    item.map((str) => {
      if (str !== `,`) return `"${str}"`;
    }));
  return `${headers}\n${escapeCommasWithQuotes.reduce(
    (acc, curr) => acc.concat(`${curr.join(`,`).trim()}\n`),
    ``,
  )}`.trim();
};

// const csvFile = createCSV(squareSpaceHeaders, correctHeaderData);
// console.log(csvFile);

// fs.writeFileSync(`${__dirname}/../square-space-uploads/stockX.SS.csv`, csvFile, `utf8`);


const exampleHeaders = [
  `url`,
  `title`,
  `desc`,
  `tags`,
  `categories`,
  `imageUrl`,
  `price`,
  `affiliate link`,
];

const exampleData = [
  [
    `Converse-Chuck-Taylor-All-Star-70s-Hi-Kith-x-Coca-Cola-Red`,
    `Converse Chuck Taylor All-Star 70s Hi Kith x Coca Cola Red`,
    `Kith and Coca-Cola have been dropping some of the most hyped Chuck Taylors this side of the 1970s. This iteration, known as the "USA" edition, comes in a clean garnet, white and egret colorway. Upping the design ante, "USA" sports a red denim upper with white "Coca-Cola" embroidery, egret off-white vulcanized sole with Kith branding, and a full translucent green outsole. These Chucks dropped in August of 2018, retailing for, $150. If you love classic brands, then you need to make sure you cop a pair of these new American classics.`,
    `Converse, Chuck, Taylor, All-Star, 70s, Hi, Kith, x, Coca, Cola, Red`,
    `men`,
    `https://stockx.imgix.net/Converse-Chuck-Taylor-All-Star-70s-Hi-Kith-Red-Product.jpg`,
    `245.00`,
    `http://click.linksynergy.com/link?id=<LSN EID>&offerid=<LSN OID>.13279338524&type=15&murl=https%3A%2F%2Fstockx.com%2Fconverse-chuck-taylor-all-star-70s-hi-kith-usa`,
  ],
  [
    `Nike-React-Element-87-Undercover-Volt`,
    `Nike React Element 87 Undercover Volt`,
    `What's better than the classic 90s' TV series "New York Undercover"? Nothing really, but the Nike React Element 87 Undercover Volt is close. First unveiled by Jun Takahasi at UNDERCOVER's Paris Fashion Week's FW18 show in March, these shoes feature 'UNDERCOVER by Jun Takahasi' stamped on the translucent yellow uppers, the cork footbed has been replaced with a mesh one, and the colors coordinate with the shoes' uppers. If you love Malik Yoba, Dick Wolf, UNDERCOVER, and Nike, then these jawns are for you.`,
    `Nike, React, Element, 87, Undercover, Volt`,
    `men`,
    `https://stockx.imgix.net/Nike-React-Element-87-Undercover-Volt-Product.jpg`,
    `230.00`,
    `http://click.linksynergy.com/link?id=<LSN EID>&offerid=<LSN OID>.13371458981&type=15&murl=https%3A%2F%2Fstockx.com%2Fnike-react-element-87-undercover-volt`,
  ],
];
