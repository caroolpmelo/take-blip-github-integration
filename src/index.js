import BlipSdk from 'blip-sdk';
import WebSocketTransport from 'lime-transport-websocket';
import { CONFIG } from '../application.js';
import { GithubResponse, ResponseData } from './GithubApiConn.js';

// Create a client instance passing the identifier and accessKey of your chatbot
const client = new BlipSdk.ClientBuilder()
    .withIdentifier(CONFIG.IDENTIFIER)
    .withAccessKey(CONFIG.ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

// Connect with server asynchronously
// Connection will occurr via websocket on 8081 port.
client.connect() // This method return a 'promise'.
    .then(function(session) {
        // Connection success. Now is possible send and receive envelopes from server. */
        console.log('Application started. Press Ctrl + c to stop.');
        if (session.state == 'established') {
            GithubResponse(); // starts github fetch
        }
    })
    .catch(function(err) { 
        console.log('Connection failed: ', err);
    });

// formats github API response data to match desired format for bot
const FormatGithubData = (fullData) => {
    return fullData.map((element) => {
        return {
            header: {
                type: "application/vnd.lime.media-link+json",
                value: {
                    title: element.full_name ,
                    text: element.description,
                    type: "image/jpeg",
                    uri: element.owner.avatar_url
                }
            }
        }
    });
}

client.addMessageReceiver(true, (m) => {
    if (m.type !== 'text/plain') return;
    
    console.log(`<< ${m.from}: ${m.content}`);
    
    // stores formated data from github json
    const formatedData = FormatGithubData(ResponseData);

    // shows loading if response is empty
    if (!formatedData.length) {
        client.sendMessage({
            to: m.from,
            type: 'application/vnd.lime.chatstate+json',
            content: {
                "state": "composing"
            }
        });
    }
    
    // show desired data if there is any
    if (formatedData.length) {
        client.sendMessage({ 
            to: m.from,
            type: 'application/vnd.lime.collection+json', 
            content: {
                itemType: "application/vnd.lime.document-select+json",
                items: formatedData
            }
        });
    }
});
