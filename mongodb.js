const {MongoClient,ObjectID, Cursor} = require('mongodb')
const connectionURL = 'mongodb://127.0.0.1:27017'
const dbName = 'task-manager'

const id = new ObjectID()
console.log(id)
console.log(id.getTimestamp())

MongoClient.connect(connectionURL, {useNewUrlParser:true}, (error, client)=>{
    if (error){
        console.log('Unable to connect to the database ' + error)
    }else {
        console.log('Connected successfully!!')
    }
    // this.mongoClient = client;

    const taskdb = client.db(dbName)

    // Code for inserting data.
    // taskdb.collection('users').insertMany([{
    //     _id : id,
    //     name:'Vikas Warkar',
    //     age : 47
    // }, {
    //     name:'Aarian Warkar',
    //     age : 11
    // }, {
    //     name:'Yvonne Warkar',
    //     age : 41
    // }, {
    //     name:'Annika Warkar',
    //     age : 7
    // }], (error, result)=>{
    //     if (error) {
    //         console.log(error)
    //     } else {
    //         console.log(result.ops)
    //     }
    // })

    // taskdb.collection('tasks').insertMany([
    //     {description:'Play Tennis', completed : true},
    //     {description:'Chores', completed : false},
    //     {description:'Home Work', completed : true}
    // ], (error, result)=>{
    //     if (error) return console.log(error)
    //     console.log(result.ops)
        
    // })


    // Code for searching data.
    
    // taskdb.collection('users').find({name:'Vikas Warkar'}).toArray((error, users)=>{
    //     console.log(users)
    // })

    // taskdb.collection('tasks').find({'completed':false}).toArray((error, tasks)=>{
    //     console.log(tasks)
    // })
    

    // const updatePromise = taskdb.collection('users').updateOne({name:'Aarian Warkar'}, 
    // {
    //     $set: {name: 'Mr. Aaarian Warkar'}
    // }).then(result=>{
    //     console.log('Docuement Updated ' + result)
    // }).catch(error =>{
    //     console.log('Errored with ' + error)
    // })


    // taskdb.collection('tasks').updateMany({completed:true}, {
    //     $set: {
    //         completed : false
    //     }
    // }).then(result=>{
    //     console.log('Tasks Updated ' + result)
    // }).catch(error => {
    //     console.log('Error occurred ' + error)
    // })

    taskdb.collection('users').deleteOne({name:'Vikas Warkar'}).then(result=>{
        console.log('Deleted Successfully ' + result.deletedCount)
    }).catch(error => {
        console.log('Error occurred ' + error)
    })
})