/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const express = require('express');
require("dotenv/config");
const app = express();


const port = process.env.PORT;

app.listen(port, () => {
    console.log('************************************'
        + `\n Server is running on the port ${port}` +
        '\n************************************');
});
