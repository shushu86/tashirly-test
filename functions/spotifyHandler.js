// const fs = require('fs')
import SpotifyWebApi from 'spotify-web-api-node';

let token
const spotifyApi = new SpotifyWebApi();
export function setToken(external_token) {
    token = external_token;
}

export const getPlaylist = async () => {
    spotifyApi.setAccessToken(token);

    try{
        const res = await spotifyApi.getPlaylist('4MnRzbbZF3VDjrynAdJCRR');    
        return res.body.external_urls.spotify;
    }
    catch(err) {
        console.log('Something went wrong!', err);
    }    

}

export async function getStationSong(playlistId, userTrackUrl) {
    console.log(token, 'token');
    spotifyApi.setAccessToken(token);
    const data = await spotifyApi.getPlaylistTracks(playlistId, {
        offset: 1,
        limit: 100,
        fields: 'items'
    })

    if (userTrackUrl) {
        return userTrackUrl;
    } 

    else {
        return data.body.items[data.body.items.length-1].track.external_urls.spotify;
    }
        
}


export async function dropMySong() {
    //console.log(token)
    spotifyApi.setAccessToken(token);

    const data = await spotifyApi.getMyRecentlyPlayedTracks({
        limit : 3
    }).then(async function(data) {
        // Output items
        const trackUri =  data.body.items[0].track.uri;
        const trackUrl = data.body.items[0].track.external_urls.spotify;

        const playlistData = await spotifyApi.getPlaylistTracks('4MnRzbbZF3VDjrynAdJCRR', {
            offset: 1,
            limit: 100,
            fields: 'items'
        });

        let tracksUrls = [];
    
        for (let i of playlistData.body.items) {
            const track = i.track.external_urls.spotify;
            tracksUrls.push(track);
        }
        
        !tracksUrls.includes(trackUrl) ? await spotifyApi.addTracksToPlaylist("4MnRzbbZF3VDjrynAdJCRR", [trackUri]) : console.log('*** Track is already in playlist ***');
        
        return getStationSong("4MnRzbbZF3VDjrynAdJCRR", trackUrl);

    }, function(err) {
        console.log('Something went wrong with getting user song!', err);
    });
    return data;
}

// function getMyData() {
//     (async () => {
//         const me = await spotifyApi.getMe();
//         // console.log(me.body);
//         dropMySong(me.body.id);
//     })().catch(e => {
//         console.error(e);
//     });
// }