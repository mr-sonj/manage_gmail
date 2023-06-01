import { getStorage } from './tab';
type Nullable<T> = T | null;

class row{
    public note:Nullable<string> = null
    public user:Nullable<string> = null
    public pass:Nullable<string> = null
    public email:Nullable<string> = null
    public phone:Nullable<string> = null
    public setValue(name:string, value:string){
        if(name=='note') this.note = value;
        else if(name=='user') this.user = value;
        else if(name=='pass') this.pass = value;
        else if(name=='email') this.email = value;
        else if(name=='phone') this.phone = value;
    }
}

export class table{
    public table: row[];

    constructor(value:string){
        let lines = value.trim().split("\n");
        let arr:row[] = [];
        for(let i=0; i<lines.length; i++){
            let status = this.getSubstring(lines[i].trim().trim(),'[',']');
            
            let data:string[];
            if(status){
                data = lines[i].split(']')[1].trim().split('\t');
            }else{
                data = lines[i].trim().split('\t');
            }

            let r = new row();
            r.note = status;
            if(data[0]) r.user = data[0].trim();
            if(data[1]) r.pass = data[1].trim();
            if(data[2]) r.email = data[2].trim();
            if(data[3]) r.phone = data[3].trim();
            
            arr.push(r);
        }
        this.table = arr;
    }
   
    async getRow(status:Nullable<string>, limit:number = 1){ 
        for(let i = 0; i < this.table.length; i++){
            if(status == this.table[i].note){
                return {
                    key: i,
                    data: this.table[i]
                }
            }
        }
        return null;
    }

    async getTextarea(){
        let value = '';
        for(let i = 0; i < this.table.length; i++){
            let r = this.table[i];
            let r_str = r.note?'['+r.note+']':'';
            r_str = r_str+(r.user?r.user:'');
            r_str = r_str+(r.pass?'\t'+r.pass:'');
            r_str = r_str+(r.email?'\t'+r.email:'');
            r_str = r_str+(r.phone?'\t'+r.phone:'');
            value = value+ r_str+'\n';
        }
        return value;
    }

    async edit(key:number, col:string, value:string){
        this.table[key].setValue(col, value);
        let value_textarea = await this.getTextarea();
        let manage_gmail_data = await getStorage('manage_gmail_data');
        if(!manage_gmail_data) return false;
        let json = JSON.parse(manage_gmail_data.toString());
        json.inputs.Textarea.value = value_textarea;
        console.log(this.table[key]);
        console.log(json);
        return await chrome.storage.local.set({'manage_gmail_data': JSON.stringify(json)});
    }

    getSubstring(string:string, char1:string, char2:string) {
        const char1Index = string.indexOf(char1);
        const char2Index = string.lastIndexOf(char2);
        if (char1Index === -1 || char2Index === -1) {
            return null;
        }
        return string.slice(char1Index + 1, char2Index);
    }
}