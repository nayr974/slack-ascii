var express = require('express');
var Slack = require('node-slack');
var request = require('request');
var dotenv = require('dotenv');

dotenv.load();

var app = express();
var slack = new Slack(process.env.SLACK_HOOK_URL);

var asciiEmoticons = {
    "bear": "ʕ •ᴥ•ʔ",
    "diretide": "༼ つ ◕_◕ ༽つ GIVE DIRETIDE",
    "do it": "(☞ﾟヮﾟ)☞",
    "eyes": "ಠ_ಠ",
    "flip": "(╯°□°）╯︵ ┻━┻",
    "lenny": "( ͡° ͜ʖ ͡°)",
    "shades": "(⌐■_■)",
    "shrug": "¯\\_(ツ)_/¯",
    "unflip": "┬──┬◡ﾉ(° -°ﾉ)",
    "y u no": "ლ(ಠ益ಠლ)",
    "epic flip": "(˚Õ˚)ر ~~~~╚╩╩╝",
    "flip all dem tables": "┻━┻( \\(°□°)/ ( ┻━┻",
    "unflip all dem tables": "┏━┓┏━┓┏━┓ ︵ /(^.^/)",
    "punch": "O=(‘-‘Q)",
    "pistols": " ̿’ ̿’\̵͇̿̿\з=(◕_◕)=ε/̵͇̿̿/’̿’̿ ̿",
    "dont mess": "ᕙ(⇀‸↼‶)ᕗ",
    "peace": "(‾⌣‾)♉",
    "gimme": "༼ つ ◕_◕ ༽つ",
    "serious": "(ಠ_ಠ)",
    "angry": "(⋟﹏⋞)",
    "sorry": "（ﾉ´д｀）",
    "meh": "ヽ(。_°)ノ",
    "zombie": "[¬º-°]¬",
    "confused": "( •᷄ὤ•᷅)？",
    "crazy": "(⊙_◎)",
    "party time": "┏(-_-)┛┗(-_- )┓┗(-_-)┛┏(-_-)┓",
    "sunglasses": "( •_•) ( •_•)>⌐■-■ (⌐■_■)",
    "help": "٩(͡๏̯͡๏)۶",
    "zap": "( ●_●)-((⌼===<((() ≍≍≍≍≍ ♒ ✺ ♒ ZAP!",
    "rage": "t(ಠ益ಠt)",
    "sad": "(╥﹏╥)",
    "sleeping": "(-.-)Zzz…",
    "love eyes": "(♥_♥)",
    "omg wat": "◕_◕",
    "man tears": "ಥ_ಥ",
    "hide": "|_・) |･ω･｀)",
    "yay": "\\(ˆ˚ˆ)/",
    "woot": "\\(^O^)/",
    "sword": "o()xxxx[{::::::::::::::::::::::::::::::::::>",
    "band aid": "( ̲̅:̲̅:̲̅:̲̅[̲̅ ̲̅]̲̅:̲̅:̲̅:̲̅ )",
    "koala": "@( * O * )@",
    "ping pong": "( •_•)O*¯`·.¸.·´¯`°Q(•_• )",
    "chillin": "<(^.^)>",
    "hugs": "(っ◕‿◕)っ",
    "whatevs": "ヾ(ｏ･ω･)ﾉ"
};

var helpResponseMessage = '';
for (emoticon in asciiEmoticons) {
    helpResponseMessage += '*' + emoticon + '*: ' + asciiEmoticons[emoticon] + '\n';
}

app.use('/', function(req, res, next) {
    if (req.query.token !== process.env.SLACK_SLASH_COMMAND_TOKEN) {
        return res.status(500).send('Cross-site request detected!');
    }
    next();
});

app.get('/', function(req, res) {
    if (req.query.text == "help") {
        return res.send(helpResponseMessage);
    }

    var userRequestUrl =
        'https://slack.com/api/users.info?' +
        'token=' + process.env.SLACK_TEAM_API_TOKEN +
        '&user=' + req.query.user_id;

    request(userRequestUrl, function (userErr, userRes, userBody) {
        if (!userErr && userRes.statusCode == 200) {
            userInfo = JSON.parse(userBody);

            if (userInfo.ok) {
                var emoticon = asciiEmoticons[req.query.text];

                if (emoticon) {
                    var payload = {
                        text: emoticon,
                        channel: req.query.channel_id,
                        username: userInfo.user.real_name,
                        icon_url: userInfo.user.profile.image_48
                    };

                    slack.send(payload);
                    res.send();
                } else {
                    res.status(404).send(' `' + req.query.text + '` not found. ' +
                        'Enter `' + req.query.command + ' help` for a list of available ASCII emoticons.');
                }
            } else {
                res.status(500).send('Error: `' + userInfo.error +'`.');
            }
        } else {
            res.status(500).send('Error: User `' + req.query.user_name +'` not found.');
        }
    });
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
