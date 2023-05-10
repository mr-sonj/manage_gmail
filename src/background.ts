import { tab, wait, clear, getStorage } from './classes/tab';
import { manage_gmail, getStatus } from './manage_gmail';

console.clear();
chrome.storage.local.set({'running': false}, function() {
    console.log('stop')
});

async function processM(msg: any){ 
    const name = msg.name;
    if(name == 'start'){
        if(await getStatus()===false){
            let manage = new manage_gmail(msg.data);
            manage.run();
            await chrome.storage.local.set({'running': true}, function() {
                console.log('running')
            });
            return true;
        }
    }else if(name == 'stop'){
        if(await getStatus() === true){
            await chrome.storage.local.set({'running': false}, function() {
                console.log('stop')
            });
            return false;
        }
    }else if(name == 'status'){
        var status = await getStatus();
        return status;
    }else if(name == 'clear'){
        await clear();
        await wait(1);
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


chrome.runtime.onInstalled.addListener(function() {
    console.clear();
    chrome.storage.local.remove('manage_gmail_data')
});
  

async function test(){
    
}

test();

