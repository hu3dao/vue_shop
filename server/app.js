const express = require('express')
const compression = require('compression')

const app = express()

// 要把这行代码放在加载静态目录前
app.use(compression())
app.use(express.static('../dist'))


app.listen(80, () => {
    console.log('server running at http//127.0.0.1');

})