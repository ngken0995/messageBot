const {MongoClient} = require("mongodb");
const {getMongoUsername, getMongoPassword} = require('./envVariable.js');

let yourModule={};

yourModule.mongodbInsert=async(jobTitle,link,company,datetime)=>{
    const uri = `mongodb+srv://${getMongoUsername()}:${getMongoPassword()}@cluster0.iexegjm.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        await addListing(client,
            {
                jobTitle:jobTitle, 
                link:link, 
                company:company, 
                datetime:datetime,
                reachedOut: false,
            }
            ,company
        );
    } catch (e) {
        console.log(e)
    } finally {
        await client.close();
    }
    return
}

async function addListing(client, newListing, company){
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne for the insertOne() docs
    const result = await client.db("sample_linkedin").collection("listings").replaceOne(
        {
            company : company
        },
            newListing
            ,
            {upsert: true}
        )
}
yourModule.mongodbFind=async()=>{
    const uri = `mongodb+srv://${getMongoUsername()}:${getMongoPassword()}@cluster0.iexegjm.mongodb.net/?retryWrites=true&w=majority`;
    const client = await new MongoClient(uri);
    
    try {
        await client.connect();
        const lists = await client.db("sample_linkedin")
        return {client, lists};
    } catch (e) {
        console.log(e)

    }
}


module.exports = yourModule;