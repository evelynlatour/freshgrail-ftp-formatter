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
  // remove indexes that are unnecessary --
  // 0, 2, 3, 4, 7, 8, 10, 11, 12, 14 - 32, 34, 36 - 38
  const keepIndices = [1, 5, 6, 9, 13, 33, 35];
  const removedIndices = feedData.map((item) => {
    const newItem = [];
    for (const indexVal of keepIndices) {
      newItem.push(item[indexVal]);
    }
    return newItem;
  });
  console.log(removedIndices);
  return removedIndices;
};

console.log(formatFeed());

// const createCSV = (headers, dataset);

const example = [
  `\n13371458981`,
  `Nike React Element 87 Undercover Volt`,
  `83d216f9-7605-49bc-9cf7-54f02cfa9b66`,
  `Apparel & Accessories`,
  `Shoes`,
  `http://click.linksynergy.com/link?id=<LSN EID>&offerid=<LSN OID>.13371458981&type=15&murl=https%3A%2F%2Fstockx.com%2Fnike-react-element-87-undercover-volt`,
  `https://stockx.imgix.net/Nike-React-Element-87-Undercover-Volt-Product.jpg`,
  ``,
  `What's better than the classic 90s' TV series "New York Undercover"? Nothing really, but the Nike React Element 87 Undercover Volt is close. First unveiled by Jun Takahasi at UNDERCOVER's Paris Fashion Week's FW18 show in March, these shoes feature 'UNDERCOVER by Jun Takahasi' stamped on the translucent yellow uppers, the cork footbed has been replaced with a mesh one, and the colors coordinate with the shoes' uppers. If you love Malik Yoba, Dick Wolf, UNDERCOVER, and Nike, then these jawns are`,
  `What's better than the classic 90s' TV series "New York Undercover"? Nothing really, but the Nike React Element 87 Undercover Volt is close. First unveiled by Jun Takahasi at UNDERCOVER's Paris Fashion Week's FW18 show in March, these shoes feature 'UNDERCOVER by Jun Takahasi' stamped on the translucent yellow uppers, the cork footbed has been replaced with a mesh one, and the colors coordinate with the shoes' uppers. If you love Malik Yoba, Dick Wolf, UNDERCOVER, and Nike, then these jawns are for you.`,
  ``,
  `amount`,
  ``,
  `230.00`,
  ``,
  ``,
  `Nike`,
  `13.95`,
  ``,
  `377281C8-E219-40EC-BE2F-17103EC21050`,
  `Nike`,
  ``,
  `in-stock`,
  `664936316507`,
  `60`,
  `USD`,
  ``,
  `http://ad.linksynergy.com/fs-bin/show?id=<LSN EID>&bids=<LSN OID>.13371458981&type=15&subid=0`,
  `Misc<LSN_DELIMITER>`,
  `Product Type<LSN_DELIMITER>`,
  `Size<LSN_DELIMITER>4.5`,
  `Material<LSN_DELIMITER>`,
  `Color<LSN_DELIMITER>Volt/University Red-Black-White`,
  `Gender<LSN_DELIMITER>male`,
  `Style<LSN_DELIMITER>`,
  `Age<LSN_DELIMITER>adult`,
];
