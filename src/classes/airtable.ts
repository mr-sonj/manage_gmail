export class airtable{
    url:string = 'https://api.airtable.com/v0/';
    key:string;
    base:string;
    table:string;

    constructor(key:string, base:string, table:string) {
        this.key = key;
        this.base = base;
        this.table = table;
    }
    
    async requestAt(url:string, method:string, data:any = null) {
        let ireq:any = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+this.key
            }
        };

        if(method!="GET"){
            ireq.body = JSON.stringify(data);
        }
        let response = await fetch(url,ireq);
        if(response.status==200){
            let json = await response.json();
            return json;
        }else{
            let json = await response.json();
            console.log(json.error.message);
            return null;
        }
    }

    async getList(maxRecords:number, filterByFormula:string = '', view:string = 'Grid%20view'){
        let url  = null;
        if(!filterByFormula)
            url = this.url+this.base+"/"+this.table+"?maxRecords="+maxRecords+"&view="+view;
        else 
            url = this.url+this.base+"/"+this.table+"?maxRecords="+maxRecords+"&view="+view+"&filterByFormula="+filterByFormula;
        return await this.requestAt(url,'GET');
    }

    async getRowById(record_id:string){
        let url = this.url+ this.base+"/"+this.table+"/"+record_id;
        return await this.requestAt(url,'GET');
    }

    async add(row:any){
        let postData = {
            "records": [
                {
                    "fields": row
                }
            ]
        }

        let url = this.url+ this.base+"/"+this.table+"/";
        let result = await this.requestAt(url,'POST',postData);
        if(result==null) return false;
        return true;
    }

    async edit(record_id:string, name_col:string, value:any){ 
        let postData = {
            records: [
                {
                    "id": record_id,
                    "fields":{
                        [name_col]: value
                    }
                }
            ],
        };
        let url = this.url+ this.base+"/"+this.table+"/";
        let result = await this.requestAt(url,'PATCH',postData);
        if(result==null) return false;
        return true;
    }
    
}