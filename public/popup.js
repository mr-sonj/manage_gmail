
function manage_gmail(){
    return {
        ready: true,
        cleaning: false,
        running: false,
        bases: [],
        error:null,
        data:{
            airtable_api_key: null,
            airtable_base_id: "",
            airtable_table_name:'gmails',
            loop: 50,
            checkLiveFirst: {
                active: false,
                key: null
            },
            login: {
                active: true,
                query: null
            },
            changeEmail: {
                active: false,
                query: null,
                disabled: false
            },
            changePass:{
                active: false,
                query: null,
                disabled: false
            },
            fixDisable: {
                active: false,
                query: null,
                disabled: false
            }
        },
        async show_error(msg = null){
            this.error = msg;
            
            setTimeout(()=>{
                this.error = null;
            }, 5000);
        },
        async init(){
            this.status();
            var data = await this.getStorage('manage_gmail_data');
            
            if(data){
                this.data = JSON.parse(data);
            }
            this.$watch('data', (value, oldValue) => chrome.storage.local.set({'manage_gmail_data': JSON.stringify(value)}));
            
            if(this.data.airtable_api_key && this.data.airtable_api_key!=""){
                this.getBases();
            }
        },
        async setStep(el){
            if(el=='login'){
                if(!this.data.login.active){
                    this.data.changeEmail.active = false;
                    this.data.changeEmail.disabled = true;
                    
                    this.data.changePass.active = false;
                    this.data.changePass.disabled = true;
                    
                    this.data.fixDisable.active = false;
                    this.data.fixDisable.disabled = true;
                }else{
                    this.data.changeEmail.disabled = false;
                    this.data.changePass.disabled = false;
                    this.data.fixDisable.disabled = false;
                }
            }else if(el=='fixDisable'){
                if(this.data.fixDisable.active){
                    this.data.changeEmail.active = false;
                    this.data.changeEmail.disabled = true;
                    
                    this.data.changePass.active = false;
                    this.data.changePass.disabled = true;
                }else{
                    this.data.changeEmail.disabled = false;
                    this.data.changePass.disabled = false;
                }
            }else if(el=='changeEmail'){
                if(this.data.changeEmail.active){
                    this.data.fixDisable.active = false;
                    this.data.fixDisable.disabled = true;
                }else{
                    if(!this.data.changePass.active){
                        this.data.fixDisable.disabled = false;
                    }
                }
            }else if(el=='changePass'){
                if(this.data.changePass.active){
                    this.data.fixDisable.active = false;
                    this.data.fixDisable.disabled = true;
                }else{
                    if(!this.data.changeEmail.active){
                        this.data.fixDisable.disabled = false;
                    }
                }
            }
        },
        getStorage(key) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get([key], function (result) {
                    if (result[key] === undefined) {
                        resolve(null);
                    } else {
                        resolve(result[key]);
                    }
                });
            });
        },
        async getBases(){
            if(this.data.airtable_api_key.trim()=="" || !this.data.airtable_api_key) return await this.show_error('Please enter Api key!');

            this.ready = false;
            let response = await fetch('https://api.airtable.com/v0/meta/bases',{
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer "+this.data.airtable_api_key
                }
            })
            // 
            if(response.status==200){
                let json = await response.json();
                this.bases = json.bases;
                this.ready = true;
            }else{
                let json = await response.json();
                await this.show_error(json.error.message+': API key airtable wrong!');
            }
        },
        async status(){
            let msg = {"name": "status"};
            chrome.runtime.sendMessage(msg, (response) => {
                this.running = response;
            }); 
        },
        async clear(){
            this.cleaning = true;
            let msg = {"name": "clear"};
            chrome.runtime.sendMessage(msg, (response) => {
                this.cleaning = false;
            }); 
        },
        async stop(){
            let msg={"name" : "stop"};
            chrome.runtime.sendMessage(msg, (response) => {
                this.running = response;
            }); 
        },
        async start(){ 
            if(this.data.loop<1) return this.show_error('Min loop =1');
            if(this.data.airtable_api_key==null || this.data.airtable_api_key.trim()=="") return this.show_error('Missing API Key from Airtable!');
            if(this.data.airtable_base_id==null || this.data.airtable_base_id.trim()=="") return this.show_error('Missing Base ID!');
            if(this.data.airtable_table_name==null || this.data.airtable_table_name.trim()=="") return this.show_error('Missing Table Name!');
            if(this.data.checkLiveFirst.active){
                if(this.data.checkLiveFirst.key==null || this.data.checkLiveFirst.key.trim()=="")
                    return this.show_error('Missing API key from Ychecker.com!');
            }

            let msg = {
                "name" : "start", 
                "data" : JSON.parse(JSON.stringify(this.data))
            };

            
            chrome.runtime.sendMessage(msg, (response) => {
                this.running = true;
            }); 
        },
        wait(ms) { return new Promise(r => setTimeout(r, ms * 1000)); }
    }
}