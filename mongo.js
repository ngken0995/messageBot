const {MongoClient} = require("mongodb");
let yourModule={};

yourModule.mongodbInsert=async(jobTitle,link,company,datetime)=>{
    const uri = "mongodb+srv://user:user@cluster0.iexegjm.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        await addListing(client,
            {
                jobTitle:jobTitle, 
                link:link, 
                company:company, 
                datetime:datetime,
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
// async function mongodbInsert(jobTitle,link,company,datetime){
//     const uri = "mongodb+srv://user:user@cluster0.iexegjm.mongodb.net/?retryWrites=true&w=majority";
//     const client = new MongoClient(uri);
//     try {
//         await client.connect();
//         await addListing(client,
//             {
//                 jobTitle:jobTitle, 
//                 link:link, 
//                 company:company, 
//                 datetime:datetime,
//             }
//         );
//     } catch (e) {
//         console.log(e)
//     } finally {
//         await client.close();
//     }
//     return
// }


async function addListing(client, newListing, company){
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne for the insertOne() docs
    const result = await client.db("sample_airbnb").collection("listings").replaceOne(
        {
            company : company
        },
            newListing
            ,
            {upsert: true}
        )
}

module.exports = yourModule;