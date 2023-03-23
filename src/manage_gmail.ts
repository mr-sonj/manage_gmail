import { airtable } from './airtable';
export class manage_gmail{
    data:any;
    constructor(data: any) {
        this.data = data;
    }
    async run(){
        var at = new airtable(this.data.airtable_api_key, this.data.airtable_base_id, this.data.airtable_table_name);
        for(var i=1; i<=this.data.loop; i++){
            var row = await at.getList(1, 'AND(status=FALSE(),note=FALSE())');
            if(row.records.length==0) return console.log('Đã hết gmail ở table');
            row = row.records[0];
            var record_id = row.id;
            var user  = row.fields.user;
            var pass  = row.fields.pass;
            var email = row.fields.email===undefined || row.fields.email.trim()===""?null:row.fields.email;
            var phone = row.fields.phone===undefined || row.fields.phone.trim()===""?null:row.fields.phone;
            console.log(row);
            // await at.edit(record_id, 'note', 'running'); 
            // var g = new google(user, pass, email, phone);
            // if(!await g.isLogin()){
            //     await tab.clearAllMsEdge();
            //     await tab.wait(3);
            //     var l = await g.login();
            //     if(!l.login){
            //         await at.edit(record_id, 'note', l.message);
            //         continue;
            //     }
            // }

            break;
        }
    }

}