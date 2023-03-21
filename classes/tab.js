class tab { 
    constructor(idTab = null) {
        this.idTab = idTab;
        this.timeWaitElement  = 60;
        this.timeWaitComeplete  = 60;
    }

    async goUrl(url){
        if(this.idTab===null){
            let tab = await this.createAsync({ url: url, active: true });
            this.idTab = tab.id
        }else{
            await this.updateAsync(this.idTab, {url: url});
        }
        return true;
    }

    async refresh(){
        await this.refreshAsync(this.idTab);
    }

    async click(element, condition = null, n=0){
        if(!await this.waitElement(element, 60)) return false; 
        await this.script(`jSozi('`+element+`').eq(`+n+`).click()`); 
        await this.wait(3);
        if(!condition) return true;
        var c = await this.checkCondition(condition, 120);
        if(c) return true;
        else return false;
    }

    async write(element, value, n=0, clear = true){
        if(!await this.waitElement(element, 60)) return false;
        if(clear)
            await this.script(`document.querySelectorAll('`+element+`')[`+n+`].value="";`);
        await this.script(`jSozi('`+element+`').eq(`+n+`).PressString('`+value+`')`);
        await this.wait((value.length*30/1000)+2);
        return true;
    }
    
    async checkCondition(condition, time = 60) {
        var check = false;
        for(var i=0; i<time ; i++){
            await this.wait(1);
            check = await this.script(condition);
            console.log(check);
            if(check) return check;
        }
        return false;
    }
 
    async getValue(code, space=false, time=10){
        var result = null;
        for(var i=0; i<time ; i++){
            await this.wait(3);
            // console.log('wait '+i);
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

    async waitElement(element, time = null, refresh = false){
        if(time===null) time = this.timeWaitElement;
        var code = `document.querySelectorAll('`+element+`').length`;
        for(var i = 0; i < time; i++){
            var result = await this.script(code);
            if(parseInt(result) > 0) {
                console.log('Found: '+element);
                return true;
            }
            await this.wait(1);
            console.log('Looking for element: '+element)
        }

        if(refresh) {
            await this.refresh();
            return await this.waitElement(element, time, false);
        }

        console.log(`Can't find element`);
        return false;
    }

    async waitComplete(){
        for(var i = 0; i < this.timeWaitComeplete; i++){
            var result = await this.script(`document.readyState`);
            if(result === "complete"){
                return true;
            }
            this.wait(1);
        }
        return false;
    }

    async script(code){
        try{
            var result = await this.scriptAsync(this.idTab, { code: code });
            return result[0];
        }catch{
            return null;
        }
    }

    async close(){
        await chrome.tabs.remove(this.idTab);
    }

    wait(ms) { return new Promise(r => setTimeout(r, ms * 1000)); }
    static wait(ms) { return new Promise(r => setTimeout(r, ms * 1000)); }

    clear(){
        var millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
        var oneYearAgo = (new Date()).getTime() - millisecondsPerYear;
        return new Promise((resolve, reject) => {
            chrome.browsingData.remove({ "since": oneYearAgo},
            {
                "appcache": true,
                "cache": true,
                "cacheStorage": true,
                "cookies": true,
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
            }, () => {
                console.log('clear');
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError));
                } else {
                    resolve();
                }
            });
        });
    }

    createAsync(properties) {
        return new Promise((resolve, reject) => {
            chrome.tabs.create(properties, async tab => {
                chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError));
                    } else {
                        if (info.status === 'complete' && tabId === tab.id) {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve(tab);
                        }
                    }
                   
                });
            });
        });
    }

    updateAsync(idTab, properties){
        return new Promise((resolve, reject) => {
            chrome.tabs.update(idTab, properties, async tab => {
                chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError));
                    } else {
                        if (info.status === 'complete' && tabId === tab.id) {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve(tab);
                        }
                    }
                });
            });
        });
    }

    refreshAsync(idTab){
        return new Promise((resolve, reject) => {
            chrome.tabs.reload(idTab, async tab => {
                chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError));
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

    waitCompleteAsync(){
        return new Promise((resolve, reject) => {
            chrome.tabs.onUpdated.addListener(function (tabId , info) {
                console.log(info.status)
                if(info.status === 'complete'){
                    resolve(true);
                }
            });
        });
    }

    scriptAsync(idTab, properties){
        return new Promise((resolve, reject) => {
            chrome.tabs.executeScript(idTab, properties, result =>{
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError));
                } else {
                    resolve(result);
                }
            });
        });
    }
    
    async getStringBetween(str, start, end) {
        const result = str.match(new RegExp(start + "(.*)" + end));
        return result[1];
    }

    static async getCookieDomain(domain) {
        try {
            var jsonCookie = {
                'url': 'https://' + domain,
                'cookies': []
            };
            await chrome.cookies.getAll({ domain: domain }, function (cookies) {
                for (var i = 0; i < cookies.length; i++) {
                    jsonCookie.cookies.push(cookies[i]);
                }
            });
            await this.wait(3);
            return jsonCookie;
        } catch (err) {
            return null;
        }
    }


    static async clearAllExceptAirtable() {
        console.log('Cleaning in progress...');
        var millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
        var oneYearAgo = (new Date()).getTime() - millisecondsPerYear;
        browser.browsingData.remove({"since": oneYearAgo},{
            "cache": true,
            "cookies": false,
            "downloads": true,
            "formData": true,
            "history": true,
            "indexedDB": true,
            "localStorage": true,
            "pluginData": true,
            "passwords": true,
            "serviceWorkers": true,
        },async() => {
            await this.clearCookie('airtable');
            console.log('Cleaned up');
        });
    }

    static async clearCookie(except = ''){
        await browser.cookies.getAll({}, function(cookies) {
            for(var i=0; i<cookies.length; i++) {
                if(!cookies[i].domain.includes(except)){
                    var domain = cookies[i].domain;
                    if(domain.charAt(0)=='.'){
                        domain = domain.substring(1);
                    }
                    var url = "https://"+domain + cookies[i].path;
                    var url2 = "http://"+domain + cookies[i].path;
                    browser.cookies.remove({url: url, name: cookies[i].name});
                    browser.cookies.remove({url: url2, name: cookies[i].name});
                }
            }
        });
    }



    
}