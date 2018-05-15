const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const request = require("request");
const morgan = require('morgan');
const config = require('./config.json');

app.use(morgan(':method :remote-addr :url :status :response-time ms'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
 
// connection configurations
const mc = mysql.createConnection(config);

// connect to database
mc.connect();

// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello world' })
});

// Parent Register
app.post('/parent/register', function (req, res) {
	
	let P_Account = req.body.P_Account;
	let P_Password = req.body.P_Password;
	let P_Name = req.body.P_Name;
	
	let queryParams = [,P_Account, P_Password, P_Name];
	console.log('Sending...');
	mc.query('INSERT INTO Parent VALUES (?,?,?,?)', queryParams, function(err, results){
		if (err) throw err;
		return res.send({error:false});		
	});
});

app.post('/parent/login', function (req, res) {
	
	let P_Account = req.body.P_Account;
	let P_Password = req.body.P_Password;
	
	let queryParams = [P_Account,P_Password];
    
	mc.query('SELECT COUNT(P_Account) as count FROM Parent WHERE P_Account = ? AND P_Password = ?',queryParams, function(err, results) {
		if (err) throw err;
		if(results[0].count === 1){
			mc.query('SELECT Pid, P_Name FROM Parent WHERE P_Account = ? AND P_Password = ?',queryParams,function(err, results) {
				if (err) throw err;
				let body = results[0];
				body.error = false;
				return res.send(body);
			});
		}
		else{
			return res.send({error:true});
		}
	});
});

/* Get user information
app.post('/user/login', function (req, res) {
	
	let phone = req.body.phone;
	let password = req.body.password;
	
	let queryParams = [phone,password];
    
	mc.query('SELECT COUNT(UserPhone) AS count FROM tabuser WHERE UserPhone = ? AND UserPassword = ?',queryParams, function(err, results) {
		if (err) throw err;
		if(results[0].count === 1){
			mc.query('SELECT UserID, UserName, UserGender, UserYear FROM tabuser WHERE UserPhone = ? AND UserPassword = ?',queryParams,function(err, results) {
				if (err) throw err;
				let body = results[0];
				body.error = false;
				return res.send(body);
			});
		}
		else{
			return res.send({error:true});
		}
	});
});

// Check phone is used or not
app.post('/user/checkPhone', function (req, res) {
	
	let phone = req.body.phone;
	
	mc.query('SELECT COUNT(UserPhone) AS count FROM tabuser WHERE UserPhone = ?', phone, function(err, results) {
		if (err) throw err;
		if(results[0].count === 0){
			return res.send({isUsed:false});		
		}
		else{
			return res.send({isUsed:true});
		}
	});
});

// User set profile
app.post('/user/setProfile', function (req, res) {
	
	let phone = req.body.phone;
	let password = req.body.password;
	let name = req.body.name;
	let gender = req.body.gender;
	let year = req.body.year;
	
	let queryParams = [,name, gender, parseInt(year), phone, password];
	
	mc.query('INSERT INTO tabuser VALUES (?,?,?,?,?,?)', queryParams, function(err, results){
		if (err) throw err;
		return res.send({error:false});		
	});
});

// User update profile
app.post('/user/updateProfile', function (req, res) {
	
	let userID = req.body.userID;
	let name = req.body.name;
	let gender = req.body.gender;
	let year = req.body.year;
	
	let queryParams = [name, gender, parseInt(year), userID];
	
	mc.query('UPDATE tabuser SET UserName = ?,UserGender = ?,UserYear = ? WHERE UserID = ?', queryParams, function(err, results){
		if (err) throw err;
		return res.send({error:false});		
	});
});

// Get diary
app.post('/diary/get', function (req, res) {
	
	let userID = req.body.userID;
	let year = req.body.year;
	let month = req.body.month;
	let day = req.body.day;
	
	let queryParams = [userID,parseInt(year),parseInt(month),parseInt(day)];
	
    mc.query('SELECT  *, COUNT(DiaryID) AS count  FROM tabdiary WHERE userID = ? AND DiaryYear = ? AND DiaryMonth = ? AND DiaryDay = ?',queryParams,function(err, results) {
		if (err) throw err;
		if(results[0].count === 1){
			let body = results[0];
			body.error = false;
			mc.query('SELECT * FROM tabrecord WHERE DiaryID = ?', body.DiaryID, function(err, results){
				if (err) throw err;
				body.Records = results;
				return res.send(body);		
			});
		}
		else if(results[0].count === 0){
			return res.send({error:true});
		}
	});
	
});

// Set user body state
app.post('/diary/setBodyState', function (req, res) {
	
	let userID = req.body.userID;
	let year = req.body.year;
	let month = req.body.month;
	let day = req.body.day;
	let height = req.body.height;
	let weight = req.body.weight;
	
	let queryParams = [userID,parseInt(year),parseInt(month),parseInt(day)];
	
	mc.query('SELECT DiaryID, COUNT(DiaryID) AS count  FROM tabdiary WHERE userID = ? AND DiaryYear = ? AND DiaryMonth = ? AND DiaryDay = ?',queryParams,function(err, results) {
		if (err) throw err;
		if(results[0].count === 1){
			mc.query('UPDATE tabdiary SET DiaryHeight = ?, DiaryWeight = ? WHERE DiaryID = ? ', [height, weight, results[0].DiaryID], function(err, results){
				if (err) throw err;
				return res.send({error:false});		
			});
		}
		else if(results[0].count === 0){
			mc.query('INSERT INTO tabdiary VALUES (?,?,?,?,?,?,?,?)', [,year, month, day, height, weight,, userID], function(err, results){
				if (err) throw err;
				return res.send({error:false});		
			});
		}
	});
	
});

// Set diary text
app.post('/diary/setDiaryText', function (req, res) {
	
	let userID = req.body.userID;
	let year = req.body.year;
	let month = req.body.month;
	let day = req.body.day;
	let diaryText = req.body.diaryText;
	
	let queryParams = [userID,parseInt(year),parseInt(month),parseInt(day)];
	
	mc.query('SELECT DiaryID, COUNT(DiaryID) AS count  FROM tabdiary WHERE userID = ? AND DiaryYear = ? AND DiaryMonth = ? AND DiaryDay = ?',queryParams,function(err, results) {
		if (err) throw err;
		if(results[0].count === 1){
			mc.query('UPDATE tabdiary SET DiaryText = ? WHERE DiaryID = ? ', [diaryText, results[0].DiaryID], function(err, results){
				if (err) throw err;
				return res.send({error:false});		
			});
		}
		else if(results[0].count === 0){
			mc.query('INSERT INTO tabdiary VALUES (?,?,?,?,?,?,?,?)', [,year, month, day,,,diaryText, userID], function(err, results){
				if (err) throw err;
				return res.send({error:false});		
			});
		}
	});
	
});

// Add Record
app.post('/diary/addRecord', function (req, res) {
	
	let userID = req.body.userID;
	let year = req.body.year;
	let month = req.body.month;
	let day = req.body.day;
	let name = req.body.name;
	let type = req.body.type;
	let cal  = req.body.cal;
	
	let queryParams = [userID,parseInt(year),parseInt(month),parseInt(day)];
	
	mc.query('SELECT DiaryID, COUNT(DiaryID) AS count  FROM tabdiary WHERE userID = ? AND DiaryYear = ? AND DiaryMonth = ? AND DiaryDay = ?',queryParams,function(err, results) {
		if (err) throw err;
		
		if(results[0].count === 1){
			mc.query('INSERT INTO tabrecord VALUES (?,?,?,?,?)', [,results[0].DiaryID, name, cal, type], function(err, results){
				if (err) throw err;
				return res.send({error:false,RecordID:results.insertId});		
			});
		}
		else if(results[0].count === 0){
			mc.query('INSERT INTO tabdiary VALUES (?,?,?,?,?,?,?,?)', [,year, month, day,,,, userID], function(err, results){
				if (err) throw err;
				mc.query('INSERT INTO tabrecord VALUES (?,?,?,?,?)', [,results.insertId, name, cal, type], function(err, results){
					if (err) throw err;
					console.log(results);
					return res.send({error:false,RecordID:results.insertId});		
				});
			});
		}
	});
	
});

// Set Record
app.post('/diary/setRecord', function (req, res) {
	
	let recordID = req.body.recordID;
	let name = req.body.name;
	let cal  = req.body.cal;
	
	let queryParams = [name, cal, recordID];
	
	mc.query('UPDATE tabrecord SET RecordName = ?,RecordCal = ? WHERE RecordID = ?', queryParams, function(err, results){
		if (err) throw err;
		return res.send({error:false});		
	});
	
	
});

// Delete Record
app.post('/diary/delRecord', function (req, res) {
	
	let recordID = req.body.recordID;
	
	mc.query('DELETE FROM tabrecord WHERE RecordID = ?', recordID, function(err, results){
		if (err) throw err;
		return res.send({error:false});		
	});
	
});
 
// Get open data
app.get('/sport', function (req, res) {
 
	var url = "http://data.hpa.gov.tw/dataset/363bc2a5-0930-40bc-89ab-b35cf1d49095/resource/6ea3a9f2-5b64-4326-b27a-c42ca05afa32/download/20141202152851.json";
	request({
		url: url,
		json: true
	}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		}
	})
});

// all other requests redirect to 404
app.all("*", function (req, res, next) {
    return res.send('page not found');
    next();
});*/
app.listen(3000);
console.log('Node app is running on port 3000');
