const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://tanvir:00000000@cluster0-bewo2.mongodb.net/test?retryWrites=true&w=majority')
    .then(client => {
        console.log('Connected!');
        _db = client.db();
        callback();
        
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
};

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'No databse found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;




/*const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'new_schema',
    password: '00000000'
});

//module.exports = pool.promise();

const Sequelize = require('sequelize');

const sequelize = new Sequelize('online_node_complete', 'root', '00000000', {
    dialect: 'mysql', host: 'localhost'
});

module.exports = sequelize;
*/

