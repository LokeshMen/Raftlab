const express = require('express');
const app = express();
const fs = require('fs')
var parse = require('csv-parse')
const ejs = require('ejs');
const bodyParser = require('body-parser');
var books = [];
var authors = [];
var magazines = [];
var newLine = '\r\n';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
function book() {
	var parser = parse({columns: true,delimiter : ";"}, function (err, records) {
		books = records;
	});
	fs.createReadStream(__dirname+'/Books.csv').pipe(parser);
};
function author() {
	var parser = parse({columns: true,delimiter : ";"}, function (err, records) {
		authors = records;
	});
	fs.createReadStream(__dirname+'/Authors.csv').pipe(parser);
};
function magazine() {
	var parser = parse({columns: true,delimiter : ";"}, function (err, records) {
		magazines = records;
	});
	fs.createReadStream(__dirname+'/Magazines.csv').pipe(parser);
};

app.get('/getBooks' ,async(req, res, next) => {
	res.send(books)
});
app.get('/getAuthors' ,async(req, res, next) => {
	res.send(authors)
});
app.get('/getMagazines' ,async(req, res, next) => {
	res.send(magazines)
});

app.get('/getbyisbn' ,async(req, res, next) => {
	const isbn =req.query.isbn
    let booksObj = books.find(data => data.isbn === isbn);
	if(!booksObj){
		let magazineObj = magazines.find(data => data.isbn === isbn);
		res.send(magazineObj)
	}
	res.send(booksObj)
});
app.get('/getbyemail' ,async(req, res, next) => {
	const email =req.query.email
	var booksandmagazines =[]
    let booksObj =  books.filter(function(item) {return (item["authors"] === email); });
	if(booksObj){
		booksandmagazines.push(booksObj)
		let magazineObj =  magazines.filter(function(item) {return (item["authors"] === email); });
		if(magazineObj){
			booksandmagazines.push(magazineObj)
			res.send(booksandmagazines)
		}

	}
	res.send("No records found..!")
});
app.get('/getbytitle' ,async(req, res, next) => {
	let titleData = books.concat(magazines)
	titleData =titleData.sort((a, b) => (a.title > b.title) ? 1 : -1);
	res.send(titleData)
});
app.get('/addbook' ,async(req, res, next) => {
	res.render('addbook');
});
app.post('/addbook' ,async(req, res, next) => {
	var csvtext = req.body.title+";"+req.body.isbn+";"+req.body.authors+";"+req.body.description
    var csv =  newLine+csvtext
    fs.appendFile(__dirname+'/Books.csv', csv, function (err) {
      if (err) throw err;
      console.log('The "data to append" was appended to file!');
    });
	book();author();magazine();
	res.render('addbook');
});
app.get('/addmagazine' ,async(req, res, next) => {
	res.render('addmagazine');
});
app.post('/addmagazine' ,async(req, res, next) => {
	var csvtext = req.body.title+";"+req.body.isbn+";"+req.body.authors+";"+req.body.publishedAt
	var csv =  newLine+csvtext
    fs.appendFile(__dirname+'/Magazines.csv', csv, function (err) {
      if (err) throw err;
      console.log('The "data to append" was appended to file!');
    });
	book();author();magazine();
	res.render('addmagazine');
});


app.listen(3000, () =>{
book();
author();
magazine();
console.log('Server started');
});
