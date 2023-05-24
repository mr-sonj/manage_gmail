import { airtable } from './classes/airtable';
import { wait,clear,getStorage } from './classes/tab';
import { google } from './classes/google';

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
                console.log(await getStatus());
                if(!await getStatus()){
                    console.log('Click stop');
                    break;
                }
                console.clear();
                var row = await at.getList(1, 'AND(status=FALSE(),note=FALSE())');
                if(row.records.length==0){
                    console.log('Đã hết gmail ở table');
                    break;
                }
                row = row.records[0];
                let record_id = row.id;
                let user  = row.fields.user;
                let pass  = row.fields.pass;
                let email = row.fields.email===undefined || row.fields.email===null?"":row.fields.email;
                let phone = row.fields.phone===undefined || row.fields.phone===null?"":row.fields.phone;

                await at.edit(record_id, 'note', 'running'); 

                if(this.data.checkLiveFirst.active){
                    let checkLiveFirst = await this.checkLiveFirst(this.data.checkLiveFirst.key,user);
                    if(this.data.fixDisable.active){
                        if(checkLiveFirst!=="Disable|NotExist"){
                            await at.edit(record_id, 'note', checkLiveFirst);
                            continue;
                        }
                    }else{
                        if(checkLiveFirst!=="Ok"){
                            await at.edit(record_id, 'note', checkLiveFirst);
                            continue;
                        }
                    }

                   
                }

                if(this.data.login.active){
                    var g = new google(user, pass, email, phone);
                    if(!await g.isLogin()){
                        await clear();
                        await wait(3);
                        var l = await g.login(null, !this.data.fixDisable.active);
                        if(this.data.fixDisable.active){
                            if(l.login){
                                await at.edit(record_id, 'note', 'Not disabled');
                                await g.t.close();
                                continue;
                            }else{
                                if(!l.message.includes('disabled')){
                                    await at.edit(record_id, 'note', 'Not disabled');
                                    await g.t.close();
                                    continue;
                                }
                            }
                        }else{
                            if(!l.login){
                                await at.edit(record_id, 'note', l.message);
                                continue;
                            }

                            await at.edit(record_id, 'avatar', g.avatar);
                        }
                            
                    }
                    
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

                    if(this.data.fixDisable.active){
                        let messages = this.list_message();
                        const random = Math.floor(Math.random() * messages.length);
                        // console.log(g.t.id);
                        // console.log(email);
                        // console.log(messages[random]);
                        let fixDis = await g.fixDisable(messages[random], email);
                        await g.t.close();
                        if(!fixDis){
                            await at.edit(record_id, 'note', 'Fix disable error');
                            continue;
                        }
                    }
                }


                await at.edit(record_id, 'note', '');
                await at.edit(record_id, 'status', "done");
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


    async checkLiveFirst(key:string, user:string){
        let ireq:any = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "x-rapidapi-ua": "RapidAPI-Playground",
                "x-rapidapi-key": key
            }
        };
        let url ="https://email-checker7.p.rapidapi.com/email-checker?email="+user
        let response = await fetch(url, ireq);
        if(response.status==200){
            let json = await response.json();
            return json.items.status;
        }else{
            return response.status;
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

    list_message(){
        return [
            "I have followed all google guidelines, but my account has been disabled, please reopen it for me!",
            "please reopen my account, I followed all google guidelines, but my account has been disabled!",
            "my account has been disabled please reopen my account i have followed all google guidelines!",
            "what happened to this account of mine i have followed all google guidelines but my account has been locked please open it again please help me!",
            "What happened to this my account, my account has been locked, I have followed all google guidelines please open again please help me!",
            "my account is locked, what happened to my account. I have followed all the instructions of google please help me open again!",
            "oh, i have followed all google guidelines, why my account has been disabled, help me to open it again!",
            "please quickly open this account for me, all google instructions, why is my account locked?",
            "Why is my account locked? please quickly open this account for me, all google instructions!",
            "i'm so sad my account has been disabled, i have followed all google policies, please reactivate my account!",
            "please reactivate my account, i am so sad my account has been disabled i have followed all google policies!",
            "i have followed all google policies please reactivate my account i am so sad my account has been disabled!",
            "hey, i followed all google guidelines, open my account immediately!",
            "hey, open my account immediately, i have followed all google guidelines, this account has been disabled!",
            "what's wrong here, my account has been locked? every google guidelines i followed please open it again help me!",
            "Is my account locked? what's wrong here, every google guidelines i followed please open it again help me!",
            "What the hell? my account has been disabled, all google instructions i have followed, get my account back!",
            "What the hell? all google instructions i followed, my account has been disabled, open my account again!",
            "What the hell? please reopen my account, all google instructions i followed, it has been disabled!",
            "why? I have followed all google guidelines but my account has been disabled please open it again for me!",
            "My account has been disabled, why? I followed google instructions, please open it again!",
            "i really need this account, it's locked, all google instructions i have followed, please open it again help me!",
            "I really need this account, please open it again, this account has been locked, all google instructions I have followed!",
            "please open this my account, i have violated something by google that my account has been disabled!",
            "What did I violate? my account has been disabled, please open this my account!",
            "I wonder why my account can be disabled, am I breaking the rules? Please open it again for me!",
            "Am I violating google's guidelines? why can't my account be disabled, please reactivate it for me!",
            "why can't my account be disabled, am i violating google's guidelines? please re-enable it for me!",
            "i'm very surprised that my account has been disabled, i have followed all google instructions, reopen it immediately!",
            "i followed all google instructions, i was surprised my account was disabled, reopened immediately!",
            "maybe you have mistakenly locked this account of mine, please activate this my account back to normal!",
            "please activate this my account back to normal, maybe you locked this account by mistake!",
            "how can this my account be disabled, sadly, i have followed google instructions, please open it again please help me!",
            "Why is my account disabled, sadly I followed google instructions, reopen it!",
            "Can you explain why my account is locked, all the rules i followed, google reopen this account for me!",
            "oh, I'm surprised because this account of mine has been locked, did I break the rules? no, i obeyed, please open it again for me!",
            "I really need this account, how can it be disabled, please open it again!",
            "there's no way this my account is locked again, all google instructions i have followed please reactivate my account!",
            "The sad thing is that this account of mine has been locked, I have followed all google guidelines, please make it active again!",
            "i have followed all google instructions, sadly my account has been locked, please reactivate!",
            "my account is locked, it's unbelievable, all google's rules i have followed, open it again for me!",
            "What thing? what can cause this account of mine to be locked, sadly, please reopen it for me!",
            "sadly, what? What could have caused my account to be locked, please reopen it for me!",
            "my account has been locked, hope it's a mistake because of all google policies i have followed, please open it again please help me!",
            "hope this is a mistake because all google policies i have followed my account has been locked please reopen please help me!",
            "every google guidelines i followed, reopen this my account!",
            "can't lock my account like this, i have followed all google guidelines, reopen it for me!",
            "please activate this my account, can't lock my account like this, i have followed all google instructions!",
            "the truth is my account has been locked, please open it again, I have followed all google instructions!",
            "i have followed all google instructions, the truth is my account has been locked, please open it again!"
        ];
    }

}