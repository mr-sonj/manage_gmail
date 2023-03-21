class airtable{
    constructor(key, base, table) {
        this.url = 'https://api.airtable.com/v0/';
        this.key = key;
        this.base = base;
        this.table = table;
    }

    async getList(maxRecords, filterByFormula = null, view = 'Grid%20view'){
        if(!filterByFormula)
            var r = await axios.get(this.url+this.base+"/"+this.table+"?maxRecords="+maxRecords+"&view="+view,{ headers: { Authorization: "Bearer "+this.key } });
        else 
            var r = await axios.get(this.url+this.base+"/"+this.table+"?maxRecords="+maxRecords+"&view="+view+"&filterByFormula="+filterByFormula,{ headers: { Authorization: "Bearer "+this.key } });
        return r['data'];
    }

    async getRowById(record_id){
        var r = await axios.get(this.url+ this.base+"/"+this.table+"/"+record_id,{ 
            headers: { Authorization: "Bearer "+this.key } 
        });
        return r['data'];
    }

    async add(row){
        var postData = {
            "records": [
                {
                    "fields": row
                }
            ]
        }
        const r = await axios.post(this.url+ this.base+"/"+this.table+"/", postData , {headers: { Authorization: "Bearer "+this.key } });
        if(r.status==200)
            return true;
        else 
            return false;
    }

    async edit(record_id, name_col, value){
        var postData = {
            records: [
                {
                    "id": record_id,
                    "fields":{
                        [name_col]: value
                    }
                }
            ],
        };
        const r = await axios.patch(this.url+ this.base+"/"+this.table+"/", postData , {headers: { Authorization: "Bearer "+this.key } });
        if(r.status==200)
            return true;
        else 
            return false;
    }
    
}