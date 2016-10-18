/************* Moduls **************/
var express = require('express')
var app = express();
app.use( express.static(__dirname + '/public'));// Serve files from ./www directory

// app.post('searchAlbumByNameOrId', (req,res)=>{
// 	if (!req.query.searchString) return res.status(401).json({'error':'missing search string'});
	
// 	console.log('req.query',req.query);
// 	console.log('req.query.searchString='+req.query.searchString);
// 	var searchString = req.query.searchString;
// 	res.json({'result':searchString});
// })

//-------------------------------------
//// Configure server host+port
app.set('host', process.env.HOST || 'localhost');
app.set('port', process.env.PORT || 3333);

app.listen(app.get('port'), function(){
  console.log('Express server listening on ' + app.get('host') + ':' + app.get('port'));
});