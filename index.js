const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
require('dotenv').config();

const emptyChar = '⠀';
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})
bot.start((ctx) => ctx.reply('Welcome !'))
bot.help((ctx) => getCovidData(ctx))
bot.launch()

function getCovidData(ctx) {
    fetch("https://covid19.saglik.gov.tr/")
        .then(res => res.text())
        .then(res => evalRes(res, ctx))
        .catch(err => console.log(err));
}

function evalRes(res, ctx) {
    let networkCovid = createCovidObject(res);
    const smsText = createSmsText(networkCovid);
    ctx.reply(smsText);
}

function createCovidObject(res) {
    const regex = /sondurumjson.+;/g;
    let found = res.match(regex)[1];
    found = found.replace('sondurumjson = ', '').replace(';', '');
    let obj = JSON.parse(found)[0];
    return obj;
}

function createSmsText(covid) {
    let smsText =
        `Tarih: ${covid.tarih}
Test: ${covid.gunluk_test}
Vaka: ${covid.gunluk_vaka}
Vefat: ${covid.gunluk_vefat}
İyileşen: ${covid.gunluk_iyilesen}

Toplam
----------------
Test: ${covid.toplam_test}
Vaka: ${covid.toplam_vaka}
Vefat: ${covid.toplam_vefat}
İyileşen: ${covid.toplam_iyilesen}
Zatürre: %${covid.hastalarda_zaturre_oran}
Ağır hasta: ${covid.agir_hasta_sayisi}
`
    return `${smsText}`;
}