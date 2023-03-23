import { tab } from './tab';
import { manage_gmail } from './manage_gmail';

async function readLocalStorage(key: string) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            if (result[key] === undefined) {
                resolve(null);
            } else {
                resolve(result[key]);
            }
        });
    });
}

async function getStatus(){
    var running =  await readLocalStorage('running');
    if(running===false) return false;
    else if(running===true) return true;
    else return false;
}

async function processM(msg: any){ 
    const name = msg.name;
    if(name == 'start'){
        if(await getStatus()===false){
            var g = new manage_gmail(msg.data);
            g.run();
            await chrome.storage.local.set({'running': true}, function() {
                console.log('running: true')
            });
            return true;
        }
    }else if(name == 'stop'){
        if(await getStatus() === true){
            await chrome.storage.local.set({'running': false}, function() {
                console.log('running: false')
            });
            return false;
        }
    }else if(name == 'status'){
        var status = await getStatus();
        return status;
    }else if(name == 'clear'){
        // await tab.clearAllMsEdge();
        // await tab.wait(1);
        return true;
    }
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    processM(msg).then(response => {
        sendResponse(response);
    }).catch(e => {
        console.log(e);
    });
    return true;
});

