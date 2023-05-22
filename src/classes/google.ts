type Nullable<T> = T | null;
import { tab, wait, getStringBetween, getStringBetween2 } from './tab';


export class google{
    user:string;
    pass:string;
    email: Nullable<string>;
    phone: Nullable<string>;
    rapt: Nullable<string> = null;
    avatar: Nullable<string> = null;
    t: tab;
    
    constructor(user:string , pass:string , email:Nullable<string> = null, phone:Nullable<string> = null) {
        this.user = user;
        this.pass = pass;
        this.email = email;
        this.phone = phone;    
    }

    async login(url:Nullable<string> = null, close = true){
        if(url===null) url = 'https://accounts.google.com/signin?hl=en&continue=https://myaccount.google.com/signinoptions/rescuephone';
        this.t = new tab();
        await this.t.goUrl(url);
        var c = ""; 
        
        //user
        await this.t.write('#identifierId', this.user); 
        let clickCheckUser = await this.t.click('#identifierNext button', `document.URL.includes('challenge/pwd') || document.querySelector('div[aria-live="assertive"]').innerText!=''`);
        if(!clickCheckUser) return { message: 'click #identifierNext button false', login : false};
        await wait(3);
        c = await this.t.script(`document.querySelector('div[jsshadow] div[aria-atomic="true"]')?document.querySelector('div[jsshadow] div[aria-atomic="true"]').innerText:null`);
        console.log(c);
        if(c!=="" && c!==null){
            if(close) await this.t.close();
            return { message: c, login : false};
        }
        
        //pass
        c = await this.writePass(this.t);
        if(c!="ok"){
            if(close) await this.t.close();
            return { message: c, login : false};
        }

        //check
        await this.isChallenge(this.t);
        let login = await this.isLogin(this.t);
        
        if(!login){
            var h1 = await this.t.script(`document.querySelector("h1").innerText`);
            if(close) await this.t.close();
            return { message: h1, login : login};
        }else{
            if(close) await this.t.close();
            return { message: 'ok', login : login};
        }
    }
    
    async fixDisable(t:tab, message:string, email:string){
        await t.click(`button[type="button"]`, `document.querySelector('h1').innerText.includes('Request a review of your account')`);
        await wait(2);
        await t.click(`button[type="button"]`,`document.querySelectorAll('textarea').length==1`);
        await wait(2);
        await t.write(`textarea`, message); 
        await wait(3);
        await t.click(`button[type="button"]`,`document.querySelectorAll('input[type="email"]').length==1`);
        await wait(2);
        await t.write(`input[type="email"]`, email);
        await wait(3);
        let click = await t.click(`button[type="button"]`,`document.querySelector('h1').innerText.includes('Your appeal was submitted')`);
        if(!click) return false;
        return true;
    }

    async changeEmail(newEmail:string){
        var t = new tab();
        await t.goUrl('https://myaccount.google.com/recovery/email?continue=https%3A%2F%2Fmyaccount.google.com%2Femail&hl=en');
        
        await wait(3);
        await this.writePass(t);

        await t.waitElement('form[novalidate] input',60);
        await t.script(`document.querySelector('form[novalidate] input').value="";`);
        await wait(2);
        await t.write(`form[novalidate] input`,newEmail);
        await t.click(`button[type="submit"]`);
        await wait(3);
        var h2 = await t.script('document.querySelectorAll("h2")[1].innerText');
        
        await t.close();
        if(h2.includes('Verify')){
            this.email = newEmail;
            return newEmail;
        }
        return null;
    }
    
    async changePass(newPass:string){
        var t = new tab();
        await t.goUrl('https://myaccount.google.com/signinoptions/password?hl=en&rapt='+this.rapt);

        await wait(3);
        await this.writePass(t);
        
        // change
        await t.write(`input[name="password"]`, newPass);
        await t.write(`input[name="confirmation_password"]`, newPass);
        var click = await t.click(`form button[type="submit"]`, 'document.URL.includes("/security")');
        await wait(3);
        await t.waitComplete();
        await t.close();
        if(click){
            this.pass = newPass;
            return newPass;
        }
        return null;
    }

    async isLogin(t:Nullable<tab>=null){
        var r =  await fetch('https://google.com/');
        var source = await r.text();
        if(source.includes(this.user) || source.includes(this.user.toLowerCase())){
            this.avatar = await getStringBetween('gbii" src="','s32-c-mo', source)+'s32-c-mo';
            if(t!==null){   
                let urlCurrent = await t.getValue(`document.URL`);
                if(urlCurrent!==null){
                    this.rapt = new URL(urlCurrent).searchParams.get('rapt');
                }
            }
            return true;
        }
        return false;
    }

    async writePass(t:tab){
        var checkPassInput = await t.script('document.querySelectorAll("#password input").length');
        if(checkPassInput==1 || checkPassInput=="1" ){
            await t.write('#password input',this.pass); 
            await t.click('#passwordNext');
            await wait(3);
            let c = await t.script(`document.querySelector('div[jsshadow] div[aria-live="polite"]').innerText`);
            if(c!=="" && c!==null && !c.includes('Verify it’s you')){
                return c;
            }
        }

        return "ok";
    }

    async isChallenge(t:any){
        var h1 = await t.script(`document.querySelector("h1").innerText`);
        // console.log(h1)
        if(h1=="Verify it’s you"){
            try{
                var list = await t.script(`document.querySelector('form[method="post"] ul').innerText`); 
            
                if(list.includes('Confirm your recovery email')){
                    var local = await this.findBtnChanllenge(list,'Confirm your recovery email');
                    if(local===null) return false;

                    await t.click(`form[method="post"] li:nth-child(`+local+`) div`);
                    await wait(2); 
                    await t.write(`input[name="knowledgePreregisteredEmailResponse"]`,this.email);
                    await wait(2); 
                    await t.click(`button[type="button"]`);
                    await wait(2); 
                    await t.waitComplete();
                    await wait(3);
                    return true;
                }

                if(list.includes('Confirm your recovery phone number')){
                    var local = await this.findBtnChanllenge(list,'Confirm your recovery phone number');
                    if(local===null) return false;

                    await t.click(`form[method="post"] li:nth-child(`+local+`) div`);
                    await wait(2); 
                    await t.write(`#phoneNumberId`,this.phone);
                    await wait(2); 
                    await t.click(`button[type="button"]`);
                    await wait(2); 
                    await t.waitComplete();
                    await wait(3);
                    return true;
                }
            
                return false;
            }catch{
                return false;
            }
        }
    }

    async findBtnChanllenge(list:any, str='Confirm your recovery email'){
        list = list.replace('Standard rates apply\n','');
        list = list.split('\n');
        // console.log(list);
        for(var i=0; i<list.length; i++){
            var c = list[i].includes(str);
            console.log(str+':'+ c);
            if(c){
                console.log(i+1);
                return i+1;
            }
        }
        return null;
    }

}