import SpotifyWebApi from 'spotify-web-api-node';
import express from 'express'
import {setToken,dropMySong,getStationSong, getPlaylist} from './spotifyHandler.js';
//import cors from "cors";
import mongoose from 'mongoose';
import serverless from 'serverless-http';

const Schema = mongoose.Schema;

const titleSchema = new Schema ({
    title1: {
        type: String,
        required: true
    },
    title2: {
        type: String,
        required: true
    },
    title3: {
        type: String,
        required: true
    }
});

const Title = mongoose.model('Title', titleSchema);

const scopes = [
    'user-top-read',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-read-playback-position',
    'user-follow-read',
    'user-follow-modify',
    'user-read-recently-played',
];
const PORT = process.env.PORT || 8888

var spotifyApi = new SpotifyWebApi({
    clientId: "be8434b919ed4aea927bf45226082e6b",//process.env.clientId, //31r66vzqvo7znl2eq6ezny4xp3tm    be8434b919ed4aea927bf45226082e6b
    clientSecret: "acb5f6cac63a4fc488f6fbe22cfd0945",//process.env.clientSecret,
    redirectUri: 'http://localhost:8888/callback'
});

const app = express()
const router = express.Router();


app.use(express.static('dist'))
//app.use(cors({origin: "*"}));

const dbURI = 'mongodb+srv://tashirly2020:1122334455@tashirly.xw5jv.mongodb.net/TashirlyDB?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then(() => {
        app.use('/.netlify/functions/functions/server', router)
        module.exports.handler = serverless(app)
    })
    .catch((err) => console.log(err))

var isGetit

router.get('/',(req, res) =>{
    isGetit = true
    res.redirect(`index2.html`);
});

router.get('/getTitles', async (req, res) =>{
   
    //getting all titles from MongoDB
    const resp = await Title.find();
    
    res.send({
        title1: resp[0].title1,
        title2: resp[1].title2,
        title3: resp[2].title3
    });
});

router.get('/login', (req, res) => {
    isGetit = true
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});
router.get('/login2', (req, res) => {
    isGetit = false
    Title.find().then((res) => console.log(res))
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

router.get('/callback', (req, res) => {
    console.log("callback");
    const error = req.query.error;
    const code = req.query.code;
    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
            const access_token = data.body['access_token'];
            const refresh_token = data.body['refresh_token'];
            const expires_in = data.body['expires_in'];
            spotifyApi.setAccessToken(access_token);
            spotifyApi.setRefreshToken(refresh_token);
            console.log('access_token:', access_token);
            console.log('refresh_token:', refresh_token);
            console.log(
                `Sucessfully retreived access token. Expires in ${expires_in} s.`
            );
            setInterval(async () => {
                const data = await spotifyApi.refreshAccessToken();
                const access_token = data.body['access_token'];

                console.log('The access token has been refreshed!');
                console.log('access_token:', access_token);
                spotifyApi.setAccessToken(access_token);
            }, expires_in / 2 * 1000);
            setToken(access_token);
            console.log("getit: ", isGetit)
        }).then(()=> {
        if (isGetit) {
            console.log(`HTTP Server up. Now go to http://localhost:${PORT}/getIt in your browser.`)
            return res.redirect("/getIt")
        } else {
        console.log(`HTTP Server down. Now go to http://localhost:${PORT}/dropIt in your browser`)
        return res.redirect("/dropIt")
        }
    })
        .catch(error => {
            console.error('Error getting Tokens:', error);
            res.send(`Error getting Tokens: ${error}`);
        })
});

router.get('/getIt',  async (req, res) => {
   try{
        const resp = await getPlaylist();
        console.log("The route is: " + resp)
        res.redirect(resp);
    }
    catch(err) {
        console.log("Error occourd: ", err)
    }
    // getStationSong('4MnRzbbZF3VDjrynAdJCRR').then((route) => {
});

router.get('/dropIt', (req, res) => {
    dropMySong().then((route) => {
        console.log("The route is: "+route)
        res.redirect(route);
        
    }).catch(error => {console.error('Error getting last song heard from user:', error)})
});

