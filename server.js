const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1FrwqN5OZpZEdL2YTyYPax3llR-hW6XmlPHlkl4uDfhY';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  let retArr = [];
  for( var i=1; i< rows.length; i++ ){    
    let retJson = {};
    for( var key of rows[0]){
      retJson[key] = rows[ i ][ rows[0].indexOf(key)];
    } 
    retArr.push(retJson);
  }// end of for two

  res.json(retArr);
  //res.json( { status: 'unimplemented', command: 'onGet '} );
}
app.get('/api', onGet);

async function onPost(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;

  const messageBody = req.body;
  console.log(messageBody);
  let newRow = [];
  for (var key in messageBody) {
    newRow[ rows[0].indexOf(key) ] = messageBody[key];
  }
  console.log(newRow);
  
  //newRow;
  const appendResult = await sheet.appendRow(newRow);

  res.json({ status: 'implemented', command: 'onPost' });
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // Get rows
  const result = await sheet.getRows();
  const rows = result.rows;
  var backupRow = [];
  for (var i = 1; i < rows.length; i++) {
    // check rows.indexOf(column)  // name or mail ... etc
    console.log(rows[i][rows[0].indexOf(column)], value);

    // find if name equal
    if (rows[i][rows[0].indexOf(column)] == value) {
      backupRow[rows[0].indexOf(column) ] = value;
      // unpack msgbody Json 
      for( var key in messageBody ){
        backupRow[rows[0].indexOf(key)] = messageBody[key];
      }
      //backupRow[rows[0].indexOf(column)] = value
      //const deleteResult = await sheet.deleteRow(i);
      const patchResult = await sheet.setRow(i, backupRow);
      
      console.log("Find ! ", rows[i][1]);

      break;
    }
  }



  
  // TODO(you): Implement onPatch.

  res.json({ status: 'unimplemented', command: 'onPatch' });
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;

  // Get rows
  const result = await sheet.getRows();
  const rows = result.rows;
  for (var i = 1; i < rows.length; i++) {
    // check rows.indexOf(column)  // name or mail ... etc
    console.log(rows[i][rows[0].indexOf(column)], value);
    
    if (rows[i][rows[0].indexOf(column)] == value ){
      const result = await sheet.deleteRow(i);
      console.log("Find ! ", rows[i][1]);
      
      break;
    }
  }
  // TODO(you): Implement onDelete.
  //console.log(column, value);
  
  res.json({ response : 'success' });
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
