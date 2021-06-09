const fs = require("fs")
const puppeteer = require('puppeteer');

//Gets the Credential using puppeteer
async function getCredentials(callback){
    const login = JSON.parse(fs.readFileSync("login.json","utf-8"));
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 20, // slow down by 20ms
    });
    const page = await browser.newPage();
    await page.goto('https://facebook.com');
    await page.type("#email", login["email"])
    await page.type("#pass", login["password"])
    await Promise.all([
        page.type("#pass",String.fromCharCode(13)),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);
    
    const cookies = await page.cookies();
    await browser.close();
    fs.writeFileSync("appstate.json", JSON.stringify(cookies,null,2))
    callback()
}


getCredentials(()=>{console.log("Credentials Retrieved!")})
