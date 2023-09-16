// Importamos la librería
import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'html-entities';
import 'dotenv/config';


const users_bgg = ['maurocor', 'juankazon', 'maticepe', 'juanecasla', 'saga_kanon'];
const users = ['juane', 'juank', 'matias', 'mauro', 'cristian'];
const url_game = 'https://boardgamegeek.com/boardgame/';

const bot = new Telegraf(process.env.BOT_TOKEN);

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export default async function webhook(req, res) {
    // comando start
    bot.start((ctx) => {
        const keyboard = Markup.inlineKeyboard(
            [
                Markup.button.callback('Listar juegos', 'listajuegos'),
                Markup.button.callback('Orden de turno', 'ordendeturno'),
                Markup.button.callback('Sortear juego', 'sorteajuegos'),
                //boton sorpresa -> busca juego aleatorio en bgg y pone datos
                //boton imagenes -> busca imagenes aleatorias en bgg 
            ],
            { columns: 1 }
        )

        return ctx.reply(`Hola ${ctx.message.from.first_name}! 😁`, keyboard)
    });
   

    // boton 'Listar juegos'
    bot.action('listajuegos', async (ctx, next) => {
        var users_keyword = users_bgg.map((user) => {
            return Markup.button.callback(user, 'listajuegos@' + user)
        });

        const keyboard = Markup.inlineKeyboard(users_keyword, { columns: 1 })

        return await ctx.editMessageText('¿De quien? 😏:', keyboard);
    });


    // lista juegos jugador elegido
    bot.action(/^listajuegos@/, async (ctx) => {

        var texto = '';
        let arr = ctx.update.callback_query.data.split('@');
        let user = arr[1];
        let url = `https://boardgamegeek.com/xmlapi2/collection?username=${user}&own=1`;
        let collection = [];

        const response = await axios.get(url);

        if (response.status == 200) {
            var options = {
                attributeNamePrefix: "@_",
                ignoreAttributes: false,
            };

            const parser = new XMLParser(options);
            let jObj = parser.parse(decode(response.data));
            collection = jObj.items.item;
        }

        var texto = '';
        collection.forEach(e => {
            texto += `[${e.name['#text']}]\n`
        });


        return await ctx.editMessageText(`Juegos de *${arr[1]}*\n${texto}`, { parse_mode: 'Markdown' })
    });


    // boton 'Orden de turno'
    bot.action('ordendeturno', async (ctx) => {
        var texto = '';

        shuffle(users).forEach((e, i) => {
            texto += `${i + 1}. ${e}\n`
        })

        return await ctx.editMessageText('*Orden de turno:*\n' + texto, { parse_mode: 'Markdown' });
    });


    // boton 'Sortear juego'
    bot.action('sorteajuegos', async (ctx, next) => {
        var users_keyword = users_bgg.map((user) => {
            return Markup.button.callback(user, 'sorteajuegos@' + user)
        });

        // boton todos
        users_keyword.push(Markup.button.callback('todos', 'sorteajuegos@*'));

        const keyboard = Markup.inlineKeyboard(users_keyword, { columns: 1 })

        return await ctx.editMessageText('¿De quien? 😏', keyboard);
    });

    bot.action(/^sorteajuegos@/, async (ctx) => {

        //ctx.answerCbQuery('Espera un momento');

        let arr = ctx.update.callback_query.data.split('@');
        let collection = [];

        let user = arr[1];
        if (arr[1] == '*') {
            user = users_bgg[Math.floor(Math.random() * users_bgg.length)]
        }
        
        let url = `https://boardgamegeek.com/xmlapi2/collection?username=${user}&own=1`;

        const response = await axios.get(url);

        if (response.status == 200) {
            var options = {
                attributeNamePrefix: "@_",
                ignoreAttributes: false,
            };

            const parser = new XMLParser(options);
            let jObj = parser.parse(decode(response.data));
            collection = jObj.items.item;
        }

        var texto = '';
        let e = collection[Math.floor(Math.random() * collection.length)];
        texto = `[${e.name['#text']}](${url_game}${e['@_objectid']})\n`


        return await ctx.editMessageText(`...y el ganador es...\n${texto}`, { parse_mode: 'Markdown' })

    });

    bot.command('dolar', async (ctx) => {
        let texto = '';                
        
        //oficial
        const res = await axios.get('https://mercados.ambito.com/dolar/oficial/variacion');
        
        if (res.status == 200) {
            texto += `<u><b>Dolar Oficial</b></u>\n`
            texto += `<b>Compra:</b> $ ${res.data.compra} - <b>Venta:</b> $ ${res.data.venta}\n`;
            texto += `<b>Fecha:</b> ${res.data.fecha}\n\n`;
        } 
    
        //informal
        const resinfo = await axios.get('https://mercados.ambito.com/dolar/informal/variacion');
        
        if (resinfo.status == 200) {
            texto += `<u><b>Dolar Informal</b></u>\n`
            texto += `<b>Compra:</b> $ ${resinfo.data.compra} - <b>Venta:</b> $ ${resinfo.data.venta}\n`;
            texto += `<b>Fecha:</b> ${resinfo.data.fecha}\n`;
        } 

        return await ctx.reply(texto, { parse_mode: 'HTML' })
    });
    
    // bot handles processed data from the event body    
    await bot.handleUpdate(req.body, res);

    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

