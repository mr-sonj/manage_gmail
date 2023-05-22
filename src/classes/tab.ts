export function wait(ms:number) { 
    return new Promise(r => setTimeout(r, ms * 1000)); 
}

export async function clear() {
    var callback = function () {
        console.clear();
    };

    var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 365;
    var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
    chrome.browsingData.remove({
        "since": oneWeekAgo
    },
        {
            "appcache": true,
            "cache": true,
            "cookies": false,
            "downloads": true,
            "fileSystems": true,
            "formData": true,
            "history": true,
            "indexedDB": true,
            "localStorage": true,
            "pluginData": true,
            "passwords": true,
            "serviceWorkers": true,
            "webSQL": true
        }, callback);

    chrome.cookies.getAll({}, function(cookies) {
        for(var i=0; i<cookies.length;i++) {
            if(!cookies[i].domain.includes('airtable')){
                var domain = cookies[i].domain;
                if(domain.charAt(0)=='.'){
                    domain = domain.substring(1);
                }
        
                var url = "https://"+domain + cookies[i].path;
                var url2 = "http://"+domain + cookies[i].path;
                chrome.cookies.remove({url: url, name: cookies[i].name});
                chrome.cookies.remove({url: url2, name: cookies[i].name});
            }
        }
    });
}

export async function getStringBetween2( start:string, end:string, str:string) {
    let result:any = str.match(new RegExp(start + "(.*)" + end));
    return result[1];
}

export async function getStringBetween(beginString:string, endString:string, originalString:string) {
    var beginIndex = originalString.indexOf(beginString);
    if (beginIndex === -1) {
        return null;
    }
    var beginStringLength = beginString.length;
    var substringBeginIndex = beginIndex + beginStringLength;
    var substringEndIndex = originalString.indexOf(endString, substringBeginIndex);
    if (substringEndIndex === -1) {
        return null;
    }
    return originalString.substring(substringBeginIndex, substringEndIndex);
}

export async function getStorage(key: string) {
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

function createAsync(properties:any) {
    return new Promise((resolve, reject) => {
        chrome.tabs.create(properties, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    if (info.status == 'complete' && tabId == tab.id) {
                        chrome.tabs.onUpdated.removeListener(listener);
                        resolve(tab);
                    }
                }
               
            });
        });
    });
}

function updateAsync(idTab:number, properties:any){
    return new Promise((resolve, reject) => {
        chrome.tabs.update(idTab, properties, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    if (info.status == 'complete' && tabId == tab?.id) {
                        chrome.tabs.onUpdated.removeListener(listener);
                        resolve(tab);
                    }
                }
            });
        });
    });
}

function refreshAsync(idTab:any, properties:any=null){
    return new Promise((resolve, reject) => {
        chrome.tabs.reload(idTab,properties, async () =>  {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    if (info.status === 'complete') {
                        chrome.tabs.onUpdated.removeListener(listener);
                        resolve(tab);
                    }
                }
            });
        });
    });
}

function waitCompleteAsync(){
    return new Promise((resolve, reject) => {
        chrome.tabs.onUpdated.addListener(function (tabId , info) {
            console.log(info.status)
            if(info.status === 'complete'){
                resolve(true);
            }
        });
    });
}

function scriptAsync(idTab:number, properties:any){
    return new Promise((resolve, reject) => {
        chrome.tabs.executeScript(idTab, properties, result =>{
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result);
            }
        });
    });
}



type Nullable<T> = T | null;

export class tab {
    id?: number;
    
    constructor(id:Nullable<number> = null) {
        if(id) this.id = id;
    }

    async goUrl(url:string){
        if(!this.id){
            let tab:any = await createAsync({ url: url, active: true });
            await wait(2);
            this.id = tab.id;
        }else{
            await updateAsync(this.id, {url: url});
        }
    }

    async refresh(){
        if(this.id) await refreshAsync(this.id);
    }

    async click(element:string, condition:Nullable<string> = null, n=0){
        if(!await this.waitElement(element, 60)) return false; // tìm trong vòng 60s coi có không cái đã.
        await this.script(`jSozi('`+element+`').eq(`+n+`).click()`); // tìm có thì click
        await wait(3);
        if(!condition) return true;
        var c = await this.checkCondition(condition, 120);
        if(c) return true;
        else return false;
    }

    async write(element:string, value:string, n=0, clear= true){
        if(!await this.waitElement(element, 60)) return false;
        if(clear)
            await this.script(`document.querySelectorAll('`+element+`')[`+n+`].value="";`);
        await this.script(`jSozi('`+element+`').eq(`+n+`).PressString('`+value+`')`);
        await wait((value.length*30/1000)+1);
        return true;
    }
    
    async checkCondition(condition:string, time = 60) {
        var check = false;
        for(var i=0; i<time ; i++){
            await wait(1);
            check = await this.script(condition);
            console.log(check);
            if(check) return check;
        }
        return false;
    }
 
    async getValue(code:string, space=false, time=20){
        var result = null;
        for(var i=0; i<time ; i++){
            await wait(3);
           
            var result = await this.script(code);
            if(!space){
                if (typeof result == 'string' && result.trim()!="") {
                    return result
                }
            }else{
                if (typeof result == 'string') {
                    return result
                }
            }
        }
        return null;
    }

    async waitElement(element:string, time=60, refresh = false):Promise<boolean>   {
        var code = `document.querySelectorAll('`+element+`').length`;
        for(var i = 0; i < time; i++){
            var result = await this.script(code);
            if(parseInt(result) > 0) {
                return true;
            }
            await wait(1);
            console.log('Looking for element: '+element)
        }
        if(refresh) {
            await this.refresh();
            return await this.waitElement(element, time, false);
        }

        console.log(`Can't find element`);
        return false;
    }

    async waitComplete(timeWaitComeplete:number = 60){
        for(var i = 0; i < timeWaitComeplete; i++){
            var result = await this.script(`document.readyState`);
            if(result === "complete"){
                return true;
            }
            wait(1);
        }
        return false;
    }

    async script(code:string){
        try{
            if(this.id){
                let result:any = await scriptAsync(this.id, { code: code });
                return result[0];
            }
        }catch{
            return null;
        }
    }

    async close(){
        if(this.id){
            await chrome.tabs.remove(this.id);
            this.id = undefined;
        }
    }
} 