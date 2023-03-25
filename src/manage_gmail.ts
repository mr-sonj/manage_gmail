import { airtable } from './airtable';
import { wait,clear,getStorage } from './tab';
import { google } from './google';

export async function getStatus(){
    var running =  await getStorage('running');
    if(running===false) return false;
    else if(running===true) return true;
    else return false;
}


export class manage_gmail{
    data:any;
    constructor(data: any) {
        this.data = data;
    }
    async run(){
        try{
            
            var at = new airtable(this.data.airtable_api_key, this.data.airtable_base_id, this.data.airtable_table_name);
            for(var i=1; i<=this.data.loop; i++){
                if(!getStatus()) return;
                console.clear();
                var row = await at.getList(1, 'AND(status=FALSE(),note=FALSE())');
                if(row.records.length==0) return console.log('Đã hết gmail ở table');
                row = row.records[0];
                let record_id = row.id;
                let user  = row.fields.user;
                let pass  = row.fields.pass;
                let email = row.fields.email===undefined || row.fields.email===null?"":row.fields.email;
                let phone = row.fields.phone===undefined || row.fields.phone===null?"":row.fields.phone;

                await at.edit(record_id, 'note', 'running'); 
                var g = new google(user, pass, email, phone);
                if(!await g.isLogin()){
                    await clear();
                    await wait(3);
                    var l = await g.login();
                    if(!l.login){
                        await at.edit(record_id, 'note', l.message);
                        continue;
                    }
                }
                await at.edit(record_id, 'avatar', g.avatar);



                if(this.data.changeEmail.active){
                    let newEmail = await this.processEmail(user, email, this.data.changeEmail.query);
                    console.log(newEmail);
                    var checkChangeEmail = await g.changeEmail(newEmail);
                    console.log(checkChangeEmail);
                    if(!checkChangeEmail){
                        await at.edit(record_id, 'note', 'Change email error');
                        continue;
                    }
                    email = checkChangeEmail;
                    await at.edit(record_id, 'email', checkChangeEmail);
                }

                if(this.data.changePass.active){
                    let newPass = await this.processPass(pass,  this.data.changePass.query);
                    console.log(newPass);
                    var checkChangePass = await g.changePass(newPass);
                    if(!checkChangePass){
                        await at.edit(record_id, 'note', 'Change pass error');
                        continue;
                    }
                    pass = checkChangePass;
                    await at.edit(record_id, 'pass', checkChangePass);
                }


                await at.edit(record_id, 'note', '');
                await at.edit(record_id, 'status', 'done');
            }
            await chrome.storage.local.set({'running': false}, function() {
                console.log('stop')
            });
        }catch(err){
            console.log(err);
            await chrome.storage.local.set({'running': false}, function() {
                console.log('stop')
            });
        }
    }

    async processPass(pass:string, query:string){
        if(query==null || query.trim()==""){
            return this.makeid(10)+'.';
        }else if(query.includes('+')){
            return pass+query.replace('+','');
        }else{
            return query;
        }   
    }

    async processEmail(user:string, email:string, query:string): Promise<string>{
        let domains=["sonjj.edu.pl","ewebrus.com","drewzen.com","odeask.com","odeask.com","ofanda.com","woopros.com","donymails.com","donymails.com","instasmail.com","yousmail.com","stempmail.com"];
        if(query==null || query.trim()==""){
            var domain = domains[Math.floor(Math.random()*domains.length)];
            return this.makeid(10)+'@'+domain;
        }else if(this.validateEmail(query)){
            return query;
        }else if(this.isValidDomainName(query)){
            if(email!=""){
                return email.split('@')[0]+'@'+query;
            }else{
                return user.split('@')[0]+'@'+query;
            }
        }else{
            return this.processEmail(user, email, "");
        }
    }

    makeid(length:number) {
        let result = '';
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }
    validateEmail(email:string) {
        return email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    isValidDomainName(str:string) {
        var pattern = /^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,}$/;
        return pattern.test(str);
    }

}