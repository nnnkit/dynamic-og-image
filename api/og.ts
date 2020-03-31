import chrome from "chrome-aws-lambda";
import { launch } from "puppeteer-core";
import { IncomingMessage, ServerResponse } from "http";

const exePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const isDev: boolean = process.env.NOW_REGION === "dev1";

interface Options {
  args: string[];
  executablePath: string;
  headless: boolean;
}
async function getOptions(isDev: boolean) {
  if (isDev) {
    return {
      args: [],
      executablePath: exePath,
      headless: false
    };
  } else {
    return {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless
    };
  }
}
async function getScreenshot(url: string, isDev: boolean) {
  const options: Options = await getOptions(isDev);
  console.log(options, "options");
  const browser = await launch(options);
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 630 });
  await page.goto(url);
  return await page.screenshot({ type: "png" });
}
export default async function handeler(
  _req: IncomingMessage,
  res: ServerResponse
) {
  try {
    console.log(isDev, "isDev");

    let file = await getScreenshot("https://coronacount.co/ogsample", isDev);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public,immutable,max-age=3600");
    res.statusCode = 200;
    res.end(file);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>An error occured</h1>");
    console.error("Error", error);
  }
}
