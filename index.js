const login = require("facebook-chat-api");
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

function runChatAPI(){
    var appStateString = fs.readFileSync("appstate.json","utf-8");
    const credentials = { appState: JSON.parse(appStateString.replace(/name/g,"key"))}
    login(credentials, (err, api) => {
        if(err) return console.error(err);
    
        api.listenMqtt ((err, message) => {
            if(message.body){
                parseMessage(api,message)
            }
        });
    });
}

getCredentials(runChatAPI)

function parseMessage(api, message){
    console.log(message.body)
    const names = message.body.match(/(?<=\b(?:im|i'm|i’m|i am)\s)[^,.]*/gi)
    if(names && names.length > 0){
        const reply = `Hi ${names[0]}, I'm Dad!`
        api.sendMessage(reply, message.threadID);
    }

}
