const { chromium } = require("playwright");
const fs = require("fs");

async function saveHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // go to Hacker News
    await page.goto("https://news.ycombinator.com", {
      waitUntil: "networkidle",
    });
    // get article title and URL
    const articles = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".titleline > a"));
      return items
        .map((item) => ({
          title: item.innerText,
          link: item.href,
        }))
        .slice(0, 10);
    });
    //CSV generation with error handling
    if (articles.length > 0) {
      const csvContent =
        "Title,URL\n" +
        articles
          .map((article) => `"${article.title}","${article.link}"`)
          .join("\n");
      fs.writeFile("topHackerNewsArticles.csv", csvContent, (err) => {
        if (err) {
          console.error("Error writing to CSV file:", err);
          return;
        }
        console.log("Successfully wrote to CSV file");
      });
    } else {
      console.log(
        "No articles found. Check the selectors or page load conditions.",
      );
    }
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
}

(async () => {
  await saveHackerNewsArticles();
})();
