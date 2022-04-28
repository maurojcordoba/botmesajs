
require('dotenv').config();

// Importamos la librería 
const { Telegraf, Markup } = require('telegraf');
const { Bgg } = require('./bgg');


const token = process.env.BOT_TOKEN

const bot = new Telegraf(token);
const bgg = new Bgg();

const users_bgg = ['maurocor', 'juankazon', 'maticepe', 'juanecasla', 'saga_kanon'];
const users = ['juane', 'juank', 'matias', 'mauro', 'cristian'];
const url_game = 'https://boardgamegeek.com/boardgame/';

bot.start((ctx) => {
    const keyboard = Markup.inlineKeyboard(
        [
            Markup.button.callback('Listar juegos', 'listajuegos'),
            Markup.button.callback('Sortear jugador', 'sorteajugador'),
            Markup.button.callback('Sortear juego', 'sorteajuegos'),
        ],
        { columns: 1 }
    )

    return ctx.reply(`Hola ${ctx.message.from.first_name}! ¿Que carajo queres? 😁`, keyboard)
});



bot.action('listajuegos', async (ctx, next) => {
    var users_keyword = users_bgg.map((user) => {
        return Markup.button.callback(user, 'listajuegos@' + user)
    });

    const keyboard = Markup.inlineKeyboard(users_keyword, { columns: 1 })

    return await ctx.editMessageText('¿De quien? 😏:', keyboard);
});




bot.action('sorteajuegos', async (ctx, next) => {
    var users_keyword = users_bgg.map((user) => {
        return Markup.button.callback(user, 'sorteajuegos@' + user)
    });

    // boton todos
    users_keyword.push(Markup.button.callback('todos', 'sorteajuegos@*'));

    const keyboard = Markup.inlineKeyboard(users_keyword, { columns: 1 })

    return await ctx.editMessageText('¿De quien? 😏', keyboard);
});


bot.action(/^listajuegos@/, (ctx) => {
    
    var texto = '';
    let arr = ctx.update.callback_query.data.split('@');

    bgg.getBggCollection(arr[1]).then(collection => {
        collection.forEach(e => {
            texto += `[${e.name['#text']}](${url_game}${e['@_objectid']})\n`
        });

        return ctx.editMessageText(`Juegos de *${arr[1]}*\n${texto}`, { parse_mode: 'Markdown' })
    });
});


bot.action(/^sorteajuegos@/, (ctx) => {

    ctx.answerCbQuery('Espera un momento');

    let arr = ctx.update.callback_query.data.split('@');
    
    const user = arr[1];
    if (arr[1] == '*') {
        user = users_bgg[Math.floor(Math.random() * users_bgg.length)]
    }
   
    bgg.getBggCollection(user).then(collection => {
       let e = collection[Math.floor(Math.random() * collection.length)];       
       let texto = `[${e.name['#text']}](${url_game}${e['@_objectid']})`

       return ctx.editMessageText(`...y el ganador es...\n${texto}`, { parse_mode: 'Markdown' })
    });    
});

bot.action('sorteajugador', async (ctx) => {
    var texto = '';

    bgg.shuffle(users).forEach((e, i) => {
        texto += `${i + 1}. ${e}\n`
    })

    return await ctx.editMessageText(texto);
});

bot.command('dado', async (ctx) => {
    const opts = {
        'emoji': '🏀'
    }
    return await ctx.telegram.sendDice(ctx.chat.id, opts);
})

bot.command('basket', async (ctx) => {
    const opts = {
        'emoji': '🏀'
    }
    return await ctx.telegram.sendDice(ctx.chat.id, opts);
})

bot.command('futbol', async (ctx) => {
    const opts = {
        'emoji': '⚽'
    }
    return await ctx.telegram.sendDice(ctx.chat.id, opts);
})

bot.command('ruleta', async (ctx) => {
    const opts = {
        'emoji': '🎰'
    }
    return await ctx.telegram.sendDice(ctx.chat.id, opts);
})



bot.launch({
  webhook: {
    domain: 'https://botmesa.vercel.app/',
    //port: 3000
  }
}).then(() => {
  console.info(`The bot ${bot.botInfo.username} is running on server`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))