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
                query: null
            },
            changePass:{
                active: false,
                query: null
            }
        },
        async show_error(msg = null){
            this.error = msg;
            
            setTimeout(()=>{
                this.error = null;
            }, 5000);
        },
        init(){
            this.status();
            var data = localStorage.getItem('manage_gmail_data');
            if(data){
                this.data = JSON.parse(data);
            }
            this.$watch('data', (value, oldValue) => localStorage.setItem('manage_gmail_data', JSON.stringify(value)));
            
            if(this.data.airtable_api_key && this.data.airtable_api_key!=""){
                this.getBases();
            }
        },
        async setStep(){
            if(!this.data.login.active){
                this.data.changeEmail.active= false;
                this.data.changePass.active= false;
            }
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
                console.log(response);
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