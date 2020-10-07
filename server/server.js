const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;


app.use('/', express.static('public'))
app.use(cors());

const budget = {
}

app.get('/hello',(req,resp)=>{
    resp.send('Hello World!')
});

app.get('/budget',(req,resp)=>{
    //resp.json(budget)
    resp.sendFile(__dirname + '/budget.json')

});

app.listen(port,()=>{
    console.log(`Example app listening at http://localhost:${port}`);
});