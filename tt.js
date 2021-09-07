const axios = require('axios');
const mongo = require('mongodb').MongoClient;
const { Telegraf, session, Extra, Markup, Scenes } = require('telegraf');
const { BaseScene, Stage } = Scenes
const { enter, leave } = Stage
const stage = new Stage()
var bot_token = '1954145272:AAHGYrPmNJJTdFa00h_Bl2CExMGY4e_yrSE'; //YOUR BOT TOKEN HERE
const bot = new Telegraf(bot_token);
let db;
const balance = new BaseScene('balance')
stage.register(balance)
const referal = new BaseScene('refferal')
stage.register(referal)
const withdraw = new BaseScene('withdraw')
stage.register(withdraw)
const wallet = new BaseScene('wallet')
stage.register(wallet)
const onWithdraw = new BaseScene('onWithdraw')
stage.register(onWithdraw)
const broadcast = new BaseScene('broadcast')
stage.register(broadcast)
const refer = new BaseScene('refer')
stage.register(refer)
const mini = new BaseScene('mini')
stage.register(mini)
const chnl = new BaseScene('chnl')
stage.register(chnl)
const removechnl = new BaseScene('removechnl')
stage.register(removechnl)
const paychnl = new BaseScene('paychnl')
stage.register(paychnl)
const bon = new BaseScene('bonus')
stage.register(bon)
const botstat = new BaseScene('Botstat')
stage.register(botstat)
const withstat = new BaseScene('withstat')
stage.register(withstat)
const tgid = new BaseScene('tgid')
stage.register(tgid)
const incr = new BaseScene('incr')
stage.register(incr)
var regex = new RegExp('.*')

bot.use(session())
bot.use(stage.middleware())
 
//CONNECT TO MONGO
mongo.connect('mongodb+srv://anand123:fmxjB56uDFtz2DU3@cluster0.ncwnx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.log(err);
    }
    db = client.db('Thunder_Tokens_Bot');
    bot.telegram.deleteWebhook().then(success => {
        success && console.log('🤖 Bot Has Been SuccessFully Registered')
        bot.launch();
    })
})

//START WITH INVITE LINK
bot.hears(/^\/start (.+[1-9]$)/, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        if (admin.length == 0) {
            db.collection('admindb').insertOne({ admin: "admin", ref: 1, cur: 'INR', paychannel: '@jsjdkkdkdhsjdk', bonus: 0.1, minimum: 1, botstat: 'Active', withstat: 'ON', 
channels: [] })
            ctx.replyWithMarkdown(
                '*😅Restart Bot With /start*'
            )
        }
        let currency = admin[0].cur
        let refer = admin[0].ref
        let bots = admin[0].botstat
        let channel = admin[0].channels
        if (bots == 'Active') {
            let data = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
            if (data.length == 0 && ctx.from.id != +ctx.match[1]) { //IF USER IS NOT IN DATA
                db.collection('allUsers').insertOne({ userID: ctx.from.id, balance: 0.00 })
                db.collection('balance').insertOne({ userID: ctx.from.id, balance: 0.00 })
                db.collection('pendingUsers').insertOne({ userID: ctx.from.id, inviter: +ctx.match[1] })
                bot.telegram.sendMessage(+ctx.match[1], "<b>🚧 New User On Your Invite Link : <a href='tg://user?id=" + ctx.from.id + "'>" + ctx.from.id + "</a></b>", { parse_mode: 'html' })
            }
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                if(channel.length == 0){
                    ctx.replyWithMarkdown(
                        "*📣 No Channels To Join*"
                    )
                }
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
                let userdata = await db.collection('pendingUsers').find({ userID: ctx.from.id }).toArray()
                let config = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
                if (('inviter' in userdata[0]) && !('referred' in config[0])) {
                    let bal = await db.collection('balance').find({ userID: userdata[0].inviter }).toArray()
                    let cur = bal[0].balance * 1
                    let ref = refer * 1
                    let final = ref + cur
                    bot.telegram.sendMessage(userdata[0].inviter, "*💰" + refer + " " + currency + " Added To Your Balance*", { parse_mode: 'markdown' })
                    bot.telegram.sendMessage(ctx.from.id, "*💹 To Check Who Invited You, Click On '✅ Check'*", { parse_mode: 'markdown', reply_markup: { inline_keyboard: [[{ text: "✅ Check", callback_data: "check" }]] } })
                    db.collection('allUsers').updateOne({ userID: ctx.from.id }, { $set: { inviter: userdata[0].inviter, referred: 'DONE' } }, { upsert: true })
                    db.collection('balance').updateOne({ userID: userdata[0].inviter }, { $set: { balance: final } }, { upsert: true })
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }

})
//START WITHOUT INVITE LINK
bot.start(async (ctx) => {
    try {
        let data = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        if (admin.length == 0) {
            db.collection('admindb').insertOne({ admin: "admin", ref: 1, cur: 'INR', paychannel: '@jsjdkkdkdhsjdk', bonus: 0.1, minimum: 1, botstat: 'Active', withstat: 'ON'
 , channels: [] })
            ctx.replyWithMarkdown(
                '*😅Restart Bot With /start*'
            )
        }
        let bots = admin[0].botstat
        if (bots == 'Active') {
            if (data.length == 0) { //IF USER IS NOT IN DATA
                db.collection('allUsers').insertOne({ userID: ctx.from.id, balance: 0 })
                db.collection('balance').insertOne({ userID: ctx.from.id, balance: 0 })
                db.collection('pendingUsers').insertOne({ userID: ctx.from.id })

            }
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                if (channel.length == 0) {
                    ctx.replyWithMarkdown(
                        "*📣 No Channels To Join*"
                    )
                }
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
//BALANCE COMMAND
//BALANCE COMMAND
bot.hears('💰 Balance', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let userbalance = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
            let ub = userbalance[0].balance
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🙌🏻 User = ' + ctx.from.first_name + '\n\n💰 Balance = ' + ub.toFixed(3) + ' ' + currency + '\n\n🪢 Invite To Earn More*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
//INVITE COMMAND
bot.hears('🙌🏻 Invite', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let refer = admin[0].ref
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🙌🏻 User =* [' + ctx.from.first_name + '](tg://user?id=' + ctx.from.id + ')\n\n*🙌🏻 Your Invite Link = https://t.me/' + ctx.botInfo.username + '?start=' + ctx.from.id + ' \n\n🪢 Invite To ' + refer + ' ' + currency + ' Per Invite*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }

})
//JOINED BUTTON
bot.hears('🟢 Joined', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let refer = admin[0].ref
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
                let userdata = await db.collection('pendingUsers').find({ userID: ctx.from.id }).toArray()
                let config = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
                if (('inviter' in userdata[0]) && !('referred' in config[0])) {
                    let bal = await db.collection('balance').find({ userID: userdata[0].inviter }).toArray()
                    let cur = bal[0].balance * 1
                    let ref = refer * 1
                    let final = ref + cur
                    bot.telegram.sendMessage(userdata[0].inviter, "*💰" + refer + " " + currency + " Added To Your Balance*", { parse_mode: 'markdown' })
                    bot.telegram.sendMessage(ctx.from.id, "*💹 To Check Who Invited You, Click On '✅ Check'*", { parse_mode: 'markdown', reply_markup: { inline_keyboard: [[{ text: "✅ Check", callback_data: "check" }]] } })
                    db.collection('allUsers').updateOne({ userID: ctx.from.id }, { $set: { inviter: userdata[0].inviter, referred: 'DONE' } }, { upsert: true })
                    db.collection('balance').updateOne({ userID: userdata[0].inviter }, { $set: { balance: final } }, { upsert: true })
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }

})
//WALLET BUTTON
//WALLET BUTTON
bot.hears('🗂 Wallet', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let data = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                if ('wallet' in data[0]) {
                    bot.telegram.sendMessage(ctx.from.id, "<b>💡 Your Currently Set " + currency + " Wallet Is</b>:\n<code>" + data[0].wallet + "</code>\n\n🗂<b> It Will Be Used For Future Withdrawals</b>", { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "🚧 Change " + currency + " Wallet 🚧", callback_data: "wallet" }]] } })
                } else {
                    bot.telegram.sendMessage(ctx.from.id, "<b>💡 Your Currently Set " + currency + " Wallet Is</b>:\n<code>'none'</code>\n\n🗂<b> It Will Be Used For Future Withdrawals</b>", { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "🚧 Set " + currency + " Wallet 🚧", callback_data: "wallet" }]] } })
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
//WITHDRAW COMMAND
bot.hears('💳 Withdraw', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let mini_with = admin[0].minimum
        let currency = admin[0].cur
        let bots = admin[0].botstat
        let withs = admin[0].withstat
        if (bots == 'Active') {
            if (withs == 'ON') {
                let channel = admin[0].channels
                var flag = 0;
                for (i in channel) {
                    let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                    let result = res.status
                    if (result == 'creator' || result == 'administrator' || result == 'member') {
                        flag += 1
                    } else {
                        flag = 0
                    }
                }
                if (flag == channel.length) {
                    let userbalance = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
                    let ub = userbalance[0].balance
                    let data = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
                    if (ub < mini_with) {
                        ctx.replyWithMarkdown(
                            '*⚠️ Must Own AtLeast ' + mini_with + ' ' + currency + ' To Make Withdrawal*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                        )
                    } else if (!data[0].wallet) {
                        ctx.replyWithMarkdown(
                            '*⚠️ Set Your Wallet Using : *`🗂 Wallet`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                        )
                    } else {
                        await bot.telegram.sendMessage(ctx.from.id, "*📤 Enter Amount To Withdraw*", {
                            parse_mode: 'markdown', reply_markup: {
                                keyboard: [['⛔ Cancel']], resize_keyboard: true
                            }
                        })
                        ctx.scene.enter('onWithdraw')
                    }
                } else {
                    mustjoin(ctx)
                }
            } else {
                ctx.replyWithMarkdown('*⛔ Withdrawal Is Currently Off*')
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
bot.hears('⛔ Cancel', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
// STATISTICS OF BOT
bot.hears('📊 Statistics', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                let statdata = await db.collection('allUsers').find({ stats: "stats" }).toArray()
                let members = await db.collection('allUsers').find({}).toArray()
                if (statdata.length == 0) {
                    db.collection('allUsers').insertOne({ stats: "stats", value: 0 })
                    ctx.reply(
                        '<b>📊 Bot Live Stats 📊\n\n📤 Total Payouts : 0 ' + currency + '\n\n💡 Total Users: ' + members.length + ' Users\n\n🔎 Coded By: <a href="tg://user?id=827167974">UNKNOWN ANAND</a></b>' , { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                    )
                } else {
                    let payout = statdata[0].value * 1
                    let memb = parseInt(members.length)
                    ctx.reply(
                        '<b>📊 Bot Live Stats 📊\n\n📤 Total Payouts : ' + payout + ' ' + currency + '\n\n💡 Total Users: ' + memb + ' Users\n\n🔎 Coded By: <a href="tg://user?id=827167974">UNKNOWN ANAND</a></b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                    )
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
//ADMIN PANEL
bot.hears('/adminhelp', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let chnl = admin[0].channels
        var final = "\n\t\t\t\t";
        for (i in chnl) {
            final += chnl[i] + "\n\t\t\t\t";
        }
        let paychannel = admin[0].paychannel
        let bonusamount = admin[0].bonus
        let mini_with = admin[0].minimum
        let refer = admin[0].ref
        let stat = admin[0].botstat
        let withst = admin[0].withstat
      
        if (stat == 'Active') {
            var botstt = '✅ Active'
        } else {
            var botstt = '🚫 Disabled'
        }
        if (withst == 'ON') {
            var with_stat = '✅ On'
        } else {
            var with_stat = '🚫 Off'
        }
        if (ctx.from.id == 827167974) {
            bot.telegram.sendMessage(ctx.from.id,
                "<b>🏡 Hey " + ctx.from.first_name + "\n🤘🏻 Welcome To Admin Panel</b>\n\n💡 Bot Current Stats: \n\t\t\t\t📛 Bot : @" + ctx.botInfo.username + "\n\t\t\t\t🤖 Bot Status: " + botstt + "\n\t\t\t\t📤 Withdrawals : " + with_stat + "\n\t\t\t\t🌲 Channels: " + final + "💰 Refer: " + refer + "\n\t\t\t\t💰 Minimum: " + mini_with + "\n\t\t\t\t💲 Currency: " + currency + "\n\t\t\t\t🎁 Bonus: " + bonusamount + "\n\t\t\t\t📤 Pay Channel: " + paychannel + ""
                , { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "💰 Change Refer", callback_data: "refer" }, { text: "💰 Change Minimum", callback_data: "minimum" }], [{ text: "🤖 Bot : " + botstt + "", callback_data: "botstat" }], [{ text: "🌲 Change Channels", callback_data: "channels" }, { text: "🎁 Change Bonus", callback_data: "bonus" }], [{ text: "📤 Withdrawals : " + with_stat + "", callback_data: "withstat" }], [{ text: "🚹 User Details", callback_data: "userdetails" }, { text: "🔄 Change Balance", callback_data: "changebal" }] ] } })
        }
    } catch (error) {
        console.log(error)
    }

})
//BONUS BUTTON
bot.hears('🎁 Bonus', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let bonusamount = admin[0].bonus
        let bots = admin[0].botstat
        let currency = admin[0].cur
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                let bdata = await db.collection('BonusUsers').find({ userID: ctx.from.id }).toArray()
                var duration_in_hours;
                var time = new Date().toISOString();
                if (bdata.length == 0) {
                    db.collection('BonusUsers').insertOne({ userID: ctx.from.id, bonus: new Date() })
                    duration_in_hours = 24;
                } else {
                    duration_in_hours = ((new Date()) - new Date(bdata[0].bonus)) / 1000 / 60 / 60;
                }
                if (duration_in_hours >= 24) {
                    let userbal = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
                    var cur = userbal[0].balance * 1
                    var balance = cur + bonusamount
                    db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { balance: balance } }, { upsert: true })
                    db.collection('BonusUsers').updateOne({ userID: ctx.from.id }, { $set: { bonus: time } }, { upsert: true })
                    ctx.replyWithMarkdown(
                        '*🎁 Congrats , You Recieved ' + bonusamount + ' ' + currency + '\n\n🔎 Check Back After 24 Hours* '
                    )
                } else {
                    ctx.replyWithMarkdown(
                        '*⛔ You Already Recieved Bonus In Last 24 Hours *'
                    )
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
bot.hears('/broadcast', async (ctx) => {
    if (ctx.from.id == 827167974) {
        ctx.replyWithMarkdown(
            '*📨 Enter Message To Broadcast*', { reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('broadcast')
    }
})
broadcast.hears(regex, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
            ctx.scene.leave('broadcast')
        } else {
            total = 0
            let users = await db.collection('allUsers').find({}).toArray()
            ctx.replyWithMarkdown(
                '*📣 Broadcast Sent To: ' + users.length + ' Users*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
            users.forEach((element, i) => {
                if (total == 5) {
                    total -= total
                    sleep(5)
                }
                total += 1
                bot.telegram.sendMessage(element.userID, "*📣 Broadcast*\n\n" + ctx.message.text, { parse_mode: 'markdown' }).catch((err) => console.log(err))
            })
            ctx.scene.leave('broadcast')
        }
    } catch (error) {
        console.log(error)
    }
})
wallet.hears(regex, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let channel = admin[0].channels
        var flag = 0;
        for (i in channel) {
            let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
            let result = res.status
            if (result == 'creator' || result == 'administrator' || result == 'member') {
                flag += 1
            } else {
                flag = 0
            }
        }
        if (flag == channel.length) {
            db.collection('allUsers').updateOne({ userID: ctx.from.id }, { $set: { wallet: ctx.message.text } }, { upsert: true })
            if (ctx.message.text == '⛔ Cancel') {
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            } else {
                ctx.replyWithMarkdown(
                    '*🗂 Wallet Address Set To: *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
                console.log(/^[a-zA-Z0-9]+$/.test("0xErts"))
            }
        } else {
            mustjoin(ctx)
        }
        ctx.scene.leave('wallet')
    } catch (error) {
        console.log(error)
    }
})
onWithdraw.on('text', async (ctx) => {
    try {
        ctx.scene.leave('onWithdraw')
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let mini_with = admin[0].minimum
        let currency = admin[0].cur
        let pay = admin[0].paychannel
        let bots = admin[0].withstat
        if (bots == 'ON') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                let userbalance = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
                let guy = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
                let inc = await db.collection('allUsers').find({ stats: "stats" }).toArray()
                let toinc = (inc[0].value * 1) + parseInt(ctx.message.text)
                let ub = userbalance[0].balance * 1
                let wallet = guy[0].wallet
                if (ctx.message.text == '⛔ Cancel'){
                  ctx.replyWithMarkdown(

                        '*⛔ Withdrawal Cancelled*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }

                    )
                    ctx.scene.leave('onWithdraw')
                } else if (isNaN(ctx.message.text)){
                    ctx.replyWithMarkdown(
                        '*⛔ Only Numeric Value Allowed*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                    )
                    ctx.scene.leave('onWithdraw')
                } else if (ctx.message.text > ub) {
                    ctx.replyWithMarkdown(
                        '*⛔ Entered Amount Is Greater Than Your Balance*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                    )
                    ctx.scene.leave('onWithdraw')
                } else if (ctx.message.text < mini_with) {
                    ctx.replyWithMarkdown(

                        '*⚠️ Minimum Withdrawal Is ' + mini_with + ' ' + currency + '*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }

                    )
                    ctx.scene.leave('onWithdraw')
                } else if (ctx.message.text > 5){
                  ctx.replyWithMarkdown(

                        '*⚠️ Maximum Withdrawal Is 5 ' + currency + '*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }

                    )
                    ctx.scene.leave('onWithdraw')
                } else {
                    bot.telegram.sendMessage(ctx.from.id,"*🤘Withdrawal Confirmation\n\n🔰 Amount : "+ctx.message.text+" "+currency+"\n🗂 Wallet :* `"+wallet+"`\n*✌️Confirm Your Transaction By Clicking On '✅ Approve'*",{parse_mode:'Markdown', reply_markup: {inline_keyboard: [[{text:"✅ Approve",callback_data:"approve"},{text:"❌ Cancel",callback_data:"cancel"}]]}})
                    }
                    db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { toWithdraw: ctx.message.text } }, { upsert: true })
                    ctx.scene.leave('onWithdraw')
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
bot.action("approve",async(ctx) => {
  try{
    let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
    let mini_with = admin[0].minimum
    let currency = admin[0].cur
    let pay = admin[0].paychannel
    let bots = admin[0].withstat
    let userbalance = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
    let toWith = userbalance[0].toWithdraw * 1
    let guy = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
    let inc = await db.collection('allUsers').find({ stats: "stats" }).toArray()
    let toinc = (inc[0].value * 1) + parseInt(toWith)
    let ub = userbalance[0].balance * 1
    let wallet = guy[0].wallet
    if(toWith == 0){
      ctx.deleteMessage()
      ctx.replyWithMarkdown("*❌No Amount Available For Withdrawal*")
      return
    } else {
        var newbal = parseInt(ub) - parseInt(toWith)
        db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { balance: newbal } }, { upsert: true })
        db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { toWithdraw:0.00 } }, { upsert: true })
        db.collection('allUsers').updateOne({ stats: "stats" }, { $set: { value: parseInt(toinc) } }, { upsert: true })
        ctx.deleteMessage()
        ctx.replyWithMarkdown( 
                        "*✅ New Withdrawal Processed ✅\n\n🚀Amount : " + toWith + " " + currency + "\n⛔ Wallet :* `" + wallet + "`\n*💡 Bot: @" + ctx.botInfo.username + "*", {parse_mode:'markdown', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } } 
                    )
            bot.telegram.sendMessage(pay, "<b>✅ New Withdrawal Requested ✅\n\n🟢 User : <a href='tg://user?id=" + ctx.from.id + "'>" + ctx.from.id + "</a>\n\n🚀Amount : " + toWith + " " + currency + "\n⛔ Address :</b> <code>" + wallet + "</code>\n\n<b>💡 Bot: @" + ctx.botInfo.username + "</b>", { parse_mode: 'html' })
             
             let amount = toWith
          axios
  .post('https://thunderap.herokuapp.com/sendThunderToken', 
    { address: wallet , amount : amount }
  )   
    }
    ctx.scene.leave('onWithdraw')
  } catch(err) {
    console.log(err)
  }
})
bot.action("cancel",async(ctx)=> {
  try{
     db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { toWithdraw:0.00 } }, { upsert: true })
     ctx.deleteMessage()
     ctx.replyWithMarkdown( 

                        "*❌ Withdrawal Cancelled *", {parse_mode:'markdown', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } } 

                    )
     ctx.scene.leave('onWithdraw')
  } catch(err) {
    console.log(err)
  }
})
refer.hears(/^[+-]?([0-9]*[.])?[0-9]+/i, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else {
            let final = ctx.message.text * 1
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { ref: final } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂New Refer Amount Set To: *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('refer')
    } catch (error) {
        console.log(error)
    }
})
mini.hears(/^[+-]?([0-9]*[.])?[0-9]+/i, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else {
            let final = ctx.message.text * 1
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { minimum: final } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂New Minimum Withdraw Set To: *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('mini')
    } catch (error) {
        console.log(error)
    }
})
bon.hears(/^[+-]?([0-9]*[.])?[0-9]+/i, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else {
            let final = ctx.message.text * 1
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { bonus: final } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂New Daily Bonus Set To: *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('bonus')
    } catch (error) {
        console.log(error)
    }
})
tgid.hears(/^[0-9]+$/, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else {
            let user = parseInt(ctx.message.text)
            let data = await db.collection('allUsers').find({ userID: user }).toArray()
            let used = await db.collection('balance').find({ userID: user }).toArray()
            if (!data[0]) {
                ctx.replyWithMarkdown(
                    '*⛔ User Is Not Registered In Our Database *', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            } else {
                let bal = used[0].balance
                let add = data[0].wallet
                let invite;
                if (!data[0].inviter) {
                    invite = 'Not Invited'
                } else {
                    invite = data[0].inviter
                }
                ctx.reply(
                    '<b>🫂 User : <a href="tg://user?id=' + ctx.message.text + '">' + ctx.message.text + '</a>\n⛔ User Id</b> : <code>' + ctx.message.text + '</code>\n\n<b>💰 Balance : ' + bal + '\n🗂 Wallet : </b><code>' + add + '</code>\n<b>🙌🏻 Inviter : </b><code>' + invite + '</code>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            }
        }
        ctx.scene.leave('tgid')
    } catch (error) {
        console.log(error)
    }
})
incr.hears(regex, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else {
            let message = ctx.message.text
            let data = message.split(" ")
            let user = data[0]
            let amount = data[1] * 1
            let already = await db.collection('balance').find({ userID: parseInt(user) }).toArray()
            let bal = already[0].balance * 1
            let final = bal + amount
            db.collection('balance').updateOne({ userID: parseInt(user) }, { $set: { balance: final } }, { upsert: true })
            ctx.reply(
                '<b>💰 Balance Of <a href="tg://user?id=' + user + '">' + user + '</a> Was Increased By ' + amount + '\n\n💰 Final Balance = ' + final + '</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
            bot.telegram.sendMessage(user, "*💰 Admin Gave You A Increase In Balance By " + amount + "*", { parse_mode: 'markdown' })
        }
        ctx.scene.leave('incr')
    } catch (error) {
        console.log(error)
    }
})
chnl.hears(regex, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else if (ctx.message.text[0] == "@") {
            let channel = admin[0].channels
            channel.push(ctx.message.text)
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { channels: channel } }, { upsert: true })
            ctx.reply(
                '<b>🗂 Channel Added To Bot : ' + ctx.message.text + '</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else {
            ctx.replyWithMarkdown(
                '*⛔ Channel User Name Must Start With "@"*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('chnl')
    } catch (error) {
        console.log(error)
    }
})
removechnl.hears(regex, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        var chan = admin[0].channels
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else if (ctx.message.text[0] == "@") {
            if (contains("" + ctx.message.text + "", chan)) {
                var result = arrayRemove(chan, "" + ctx.message.text + "");
                db.collection('admindb').updateOne({ admin: "admin" }, { $set: { channels: result } }, { upsert: true })
                ctx.reply(
                    '<b>🗂 Channel Removed From Bot : ' + ctx.message.text + '</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            } else {
                ctx.reply(
                    '<b>⛔ Channel Not In Our Database</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
                )
            }
        } else {
            ctx.replyWithMarkdown(
                '*⛔ Channel User Name Must Start With "@"*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('removechnl')
    } catch (error) {
        console.log(error)
    }
})
paychnl.hears(regex, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else if (ctx.message.text[0] == "@") {
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { paychannel: "" + ctx.message.text + "" } }, { upsert: true })
            ctx.reply(
                '<b>🗂 Pay Channel Set To : ' + ctx.message.text + '</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        } else {
            ctx.replyWithMarkdown(
                '*⛔ Channel User Name Must Start With "@"*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('paychnl')
    } catch (error) {
        console.log(error)
    }
})
bot.action('botstat', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let paychannel = admin[0].paychannel
        let bonusamount = admin[0].bonus
        let mini_with = admin[0].minimum
        let refer = admin[0].ref
        let stat = admin[0].botstat
        let withst = admin[0].withstat
        let chnl = admin[0].channels
        var final = "\n\t\t\t\t";
        for (i in chnl) {
            final += chnl[i] + "\n\t\t\t\t";
        }
     
        if (stat == 'Active') {
            var botstt = '🚫 Disabled'
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { botstat: 'Disabled' } }, { upsert: true })
        } else {
            var botstt = '✅ Active'
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { botstat: 'Active' } }, { upsert: true })
        }
        if (withst == 'ON') {
            var with_stat = '✅ On'
        } else {
            var with_stat = '🚫 Off'
        }
        if (ctx.from.id == 827167974 ) {
            ctx.editMessageText("<b>🏡 Hey " + ctx.from.first_name + "\n🤘🏻 Welcome To Admin Panel</b>\n\n💡 Bot Current Stats: \n\t\t\t\t📛 Bot : @" + ctx.botInfo.username + "\n\t\t\t\t🤖 Bot Status: " + botstt + "\n\t\t\t\t📤 Withdrawals : " + with_stat + "\n\t\t\t\t🌲 Channel:" + final + "\n\t\t\t\t💰 Refer: " + refer + "\n\t\t\t\t💰 Minimum: " + mini_with + "\n\t\t\t\t💲 Currency: " + currency + "\n\t\t\t\t🎁 Bonus: " + bonusamount + "\n\t\t\t\t📤 Pay Channel: " + paychannel + ""
                , { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "💰 Change Refer", callback_data: "refer" }, { text: "💰 Change Minimum", callback_data: "minimum" }], [{ text: "🤖 Bot : " + botstt + "", callback_data: "botstat" }], [{ text: "🌲 Change Channels", callback_data: "channels" }, { text: "🎁 Change Bonus", callback_data: "bonus" }], [{ text: "📤 Withdrawals : " + with_stat + "", callback_data: "withstat" }], [{ text: "🚹 User Details", callback_data: "userdetails" }, { text: "🔄 Change Balance", callback_data: "changebal" }] ] } })
        }
    } catch (error) {
        console.log(error)
    }
})
bot.action('withstat', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let paychannel = admin[0].paychannel
        let bonusamount = admin[0].bonus
        let mini_with = admin[0].minimum
        let refer = admin[0].ref
        let stat = admin[0].botstat
        let withst = admin[0].withstat
        let chnl = admin[0].channels
        var final = "\n\t\t\t\t";
        for (i in chnl) {
            final += chnl[i] + "\n\t\t\t\t";
        }
    
        if (stat == 'Active') {
            var botstt = '✅ Active'
        } else {
            var botstt = '🚫 Disabled'
        }
        if (withst == 'ON') {
            var with_stat = '🚫 Off'
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { withstat: 'OFF' } }, { upsert: true })
        } else {
            var with_stat = '✅ On'
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { withstat: 'ON' } }, { upsert: true })
        }
        if (ctx.from.id == 1034365979) {
            ctx.editMessageText("<b>🏡 Hey " + ctx.from.first_name + "\n🤘🏻 Welcome To Admin Panel</b>\n\n💡 Bot Current Stats: \n\t\t\t\t📛 Bot : @" + ctx.botInfo.username + "\n\t\t\t\t🤖 Bot Status: " + botstt + "\n\t\t\t\t📤 Withdrawals : " + with_stat + "\n\t\t\t\t🌲 Channel:" + first + "\n\t\t\t\t💰 Refer: " + refer + "\n\t\t\t\t💰 Minimum: " + mini_with + "\n\t\t\t\t💲 Currency: " + currency + "\n\t\t\t\t🎁 Bonus: " + bonusamount + "\n\t\t\t\t📤 Pay Channel: " + paychannel + ""
                , { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "💰 Change Refer", callback_data: "refer" }, { text: "💰 Change Minimum", callback_data: "minimum" }], [{ text: "🤖 Bot : " + botstt + "", callback_data: "botstat" }], [{ text: "🌲 Change Channels", callback_data: "channels" }, { text: "🎁 Change Bonus", callback_data: "bonus" }], [{ text: "📤 Withdrawals : " + with_stat + "", callback_data: "withstat" }], [{ text: "🚹 User Details", callback_data: "userdetails" }, { text: "🔄 Change Balance", callback_data: "changebal" }] ] } })
        }
    } catch (error) {
        console.log(error)
    }
})
bot.action('refer', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Enter New Refer Bonus Amount*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('refer')
    } catch (error) {
        console.log(error)
    }
})
bot.action('minimum', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Enter New Minimum Withdraw Amount*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('mini')
    } catch (error) {
        console.log(error)
    }
})
bot.action('bonus', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Enter New Daily Bonus Amount*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('bonus')
    } catch (error) {
        console.log(error)
    }
})
bot.action('userdetails', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Enter Users Telegram Id to Check His Info*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('tgid')
    } catch (error) {
        console.log(error)
    }
})
bot.action('changebal', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send User Telegram Id & Amount\n\n⚠️ Use Format : *`' + ctx.from.id + ' 10`', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('incr')
    } catch (error) {
        console.log(error)
    }
})
bot.action('channels', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let chnl = admin[0].channels
        var final = "";
        if (chnl.length == 0) {
            final = "📣 No Channels Set"
        } else {
            for (i in chnl) {
                final += chnl[i] + "\n\t\t\t\t";
            }
        }
        ctx.editMessageText("<b>🏡 Currently Set Channels:\n\t\t\t\t " + final + " </b>", { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "➕ Add Channels", callback_data: "chnl" }, { text: "➖ Remove Channel", callback_data: "removechnl" }], [{ text: "📤 Pay Channel", callback_data: "paychannel" }]] } })
    } catch (error) {
        console.log(error)
    }
})
bot.action('chnl', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send New Username Of Channel*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('chnl')
    } catch (error) {
        console.log(error)
    }
})
bot.action('removechnl', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send Username Of Channel*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('removechnl')
    } catch (error) {
        console.log(error)
    }
})
bot.action('paychannel', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send Username Of Channel*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('paychnl')
    } catch (error) {
        console.log(error)
    }
})
bot.action('check', async (ctx) => {
    try {
        let userdata = await db.collection('pendingUsers').find({ userID: ctx.from.id }).toArray()
        let invite = userdata[0].inviter
        ctx.editMessageText(
            "<b>💹 You Were Invited By <a href='tg://user?id=" + invite + "'>" + invite + "</a></b>", { parse_mode: 'html' }
        )
    } catch (error) {
        console.log(error)
    }
})
bot.action('wallet', async (ctx) => {
    try {
        ctx.deleteMessage()
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        ctx.reply(
            '*✏️ Now Send Your ' + currency + ' Wallet Address To Use It For Future Withdrawals*\n\n⚠️ _This Wallet Will Be Used For Future Withdrawals !!_', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('wallet')
    } catch (error) {
        console.log(error)
    }
})

async function mustjoin(ctx) {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let chnl = admin[0].channels
        var final = '';
        for (i in chnl) {
            final += chnl[i] + "\n";
        }
        ctx.reply(
            "<b>⛔️ Must Join All Our Channel</b>\n\n@TheSuperPower\n" + final + "\n<b>✅ After Joining, Click On '🟢 Joined'</b>", { parse_mode: 'html', reply_markup: { keyboard: [['🟢 Joined']], resize_keyboard: true } }
        )
    } catch (error) {
        console.log(error)
    }
};
function sleep(in_sec) {
    return new Promise(resolve => setTimeout(resolve, in_sec * 1000));
};
function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}
function arrayRemove(arr, value) {

    return arr.filter(function (ele) {
        return ele != value;
    });
}
function contains(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}
