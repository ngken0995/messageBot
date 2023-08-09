const {MongoClient} = require("mongodb");

async function main() {
    const uri = "mongodb+srv://user:user@cluster0.iexegjm.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        await createListing(client,
            {
                name: "Lovely Loft",
                summary: "A charming loft in Paris",
                bedrooms: 1,
                bathrooms: 1
            }
        );
    } catch (e) {
        console.log(e)
    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function createListing(client, newListing){
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne for the insertOne() docs
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}