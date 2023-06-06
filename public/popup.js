function manage_gmail(){
    return {
        copy: false,
        ready: true,
        cleaning: false,
        running: false,
        bases: [],
        list_input:[],
        info_textarea:{
            total: 0,
            valid_line: 0,
            processed: 0,
        },
        error:null,
        data:{
            inputs:{
                Airtable:{
                    airtable_api_key: null,
                    airtable_base_id: "",
                    airtable_table_name:'gmails',
                },
                Textarea:{
                    value: null,
                }
            },
            input: 'Airtable',
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

            this.list_input= Object.keys(this.data.inputs);

            this.status();
            var data = await this.getStorage('manage_gmail_data');
            if(data){
                this.data = JSON.parse(data);
            }
            
            this.$watch('data', (value, oldValue) => chrome.storage.local.set({'manage_gmail_data': JSON.stringify(value)}));
            this.$watch('data.inputs.Textarea.value', (value, oldValue) => this.checkTextarea(value));
            this.checkTextarea(this.data.inputs.Textarea.value);
            if(this.data.inputs.Airtable.airtable_api_key && this.data.inputs.Airtable.airtable_api_key!=""){
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
            if(this.data.inputs.Airtable.airtable_api_key.trim()=="" || !this.data.inputs.Airtable.airtable_api_key) return await this.show_error('Please enter Api key!');

            this.ready = false;
            let response = await fetch('https://api.airtable.com/v0/meta/bases',{
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer "+this.data.inputs.Airtable.airtable_api_key
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

            if(this.data.input=='Airtable'){
                if(this.data.inputs.Airtable.airtable_api_key==null || this.data.inputs.Airtable.airtable_api_key.trim()=="") return this.show_error('Missing API Key from Airtable!');
                if(this.data.inputs.Airtable.airtable_base_id==null || this.data.inputs.Airtable.airtable_base_id.trim()=="") return this.show_error('Missing Base ID!');
                if(this.data.inputs.Airtable.airtable_table_name==null || this.data.inputs.Airtable.airtable_table_name.trim()=="") return this.show_error('Missing Table Name!');
            }

            if(this.data.input=='Textarea'){
                if(this.data.inputs.Textarea.value=="")  return this.show_error('Missing list gmail!');
                    
                
            }
            
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
        async checkTextarea(value){
            if(value==null) return;
            let lines = value.trim().split("\n");
            let valid_line = 0, processed=0;
            for (var i = 0; i <lines.length; i++){
                let line = lines[i].trim();
                if(line=='')  continue;
                let col = null;
                let check_line = true;
                if(line.split(' ').length < 2)
                    if(line.split('|').length < 2)
                        if(line.split("\t").length < 2)
                            check_line = false;
                        else col = line.split("\t");
                    else col = line.split("|");
                else col = line.split(" ");

                if(check_line){
                    valid_line++; 
                    if(this.getSubstring(lines[i].trim(),'[',']') =='invalid'){
                        col[0] = col[0].split(']')[1];
                        lines[i] =  col.map(s => s.trim()).join('\t');
                    }else{
                        lines[i] =  col.map(s => s.trim()).join('\t');
                    }
                    
                }else{
                    if(!this.getSubstring(lines[i].trim(),'[',']')){
                        lines[i] = '[invalid]'+lines[i].trim();
                    }

                    continue;
                }

                
                if(this.getSubstring(lines[i].trim(),'[',']')) processed++;

                
                
            }

            this.info_textarea = {
                total: lines.length,
                valid_line: valid_line,
                processed: processed,
            }

            this.data.inputs.Textarea.value = lines.join('\n');
            
        },
        async copy_act(type){
            let value = this.data.inputs.Textarea.value;
            if(type=='all'){
                await this.copyText(value);
            }else if(type=='ok'){
                let arr = value.split('\n');
                let str = '';
                for(let i=0; i<arr.length; i++){
                    let line = arr[i];
                    if(line.includes('[done]')){
                        line = line.replace('[done]','');
                        // console.log(line);
                        str = str + line+'\n';
                    }
                }

                await this.copyText(str);

            }else if(type=='error'){
                let arr = value.split('\n');
                let str = '';
                for(let i=0; i<arr.length; i++){
                    let line = arr[i];
                    if(line.includes('[') && line.includes(']') && !line.includes('[done]')){
                        // console.log(line);
                        str = str + line+'\n';
                    }
                }

                await this.copyText(str);
            }else if(type=='unprocessed'){
                let arr = value.split('\n');
                let str = '';
                for(let i=0; i<arr.length; i++){
                    let line = arr[i];
                    if(!line.includes('[') ){
                        // console.log(line);
                        str = str + line+'\n';
                    }
                }

                await this.copyText(str);
            }else{

            }
        },
        async copyText(textToCopy) {
            this.copy = true;
            var myTemporaryInputElement = document.createElement("textarea");
            myTemporaryInputElement.value = textToCopy;
            document.body.appendChild(myTemporaryInputElement);
            myTemporaryInputElement.select();
            document.execCommand("Copy");
            document.body.removeChild(myTemporaryInputElement);
            await this.wait(1);
            this.copy = false;
        },
        getSubstring(string, char1, char2) {
            const char1Index = string.indexOf(char1);
            const char2Index = string.lastIndexOf(char2);
          
            if (char1Index === -1 || char2Index === -1) {
              return null;
            }
          
            return string.slice(char1Index + 1, char2Index);
        },
        wait(ms) { return new Promise(r => setTimeout(r, ms * 1000)); }
    }
}