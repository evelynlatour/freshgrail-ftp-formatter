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
    const url = removeChars.replace(/\./g, `-`).split(` `).join(`-`);
    item.splice(2, 0, tags);
    item.splice(0, 0, url);
  });

  console.log(formatIndices);
  // at this point should have an array for each product that contains the following
  // [url, title, desc, tags, categories, imageUrl, price, affiliate link]

  return formatIndices;
};

formatFeed();

// const createCSV = (headers, dataset);

const example2 = [
  `adidas ZX Flux Xeno All Star Black`,
  `533b62ae-29d0-4688-8fdf-54e29ed8ca2b`, // can only be 20 chars for SS, leave blank
  `http://click.linksynergy.com/link?id=<LSN EID>&offerid=<LSN OID>.13417612943&type=15&murl=https%3A%2F%2Fstockx.com%2Fadidas-zx-flux-xeno-all-star-black`,
  `https://stockx.imgix.net/Adidas-ZX-Flux-Xeno-All-Star-Black-Product.jpg`,
  `adidas ZX Flux Xeno All Star Black`,
  `100.00`,
  `men`,
];
