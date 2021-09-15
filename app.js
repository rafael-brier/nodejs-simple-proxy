const express = require('express');
const { createProxyMiddleware, createPathRewriter } = require('http-proxy-middleware');
const { chunkenator } = require('./chunkenator');

// Create Express Server
const app = express();

// Configuration
const PORT = 666;
const HOST = "localhost";

// Proxy Cnnfig
const proxyConfig = {
    target: 'http://localhost:667',
    rules: [{
        regex: '^/',
        value: '/'
    }],
    changeOrigin: true
}

// Path Rewriter Fn
function pathRewriteFn(path) {
    let result = path;
    for (const rule of proxyConfig.rules) {
        const regex = new RegExp(rule.regex);
        if (regex.test(path)) {
            result = result.replace(regex, rule.value);
            console.log(`Redirect ${path} -> ${result}`)
            break;
        }
    }
    return result;
}

app.get('/configProxy/changeTarget', (req, res) => {
    const queryParams = req.query;
    if (queryParams.target) {
        console.log("TargetUrl: ", queryParams.target)
        proxyConfig.target = queryParams.target;
        res.send("Target alterado para: " + proxyConfig.target)
    } else {
        res.status(400).send("Informe o novo Target via 'Query Param'. Ex.: ?target=http://seuDominio:suaPorta")
    }
})

app.get('/configProxy/changeRules', (req, res) => {
    const queryParams = req.query;
    if (queryParams.rules) {
        try {
            const rulesArray = JSON.parse(queryParams.rules);
            if (rulesArray.length % 2 === 0) {
                const rulesChunkedArray = chunkenator(rulesArray, 2, x => x % 2);

                proxyConfig.rules = rulesChunkedArray.reduce((prev, curr) => ([...prev, { regex: curr[0], value: curr[1] }]), [])

                res.send("Rules alteradas paras: " + JSON.stringify(proxyConfig.rules, null, 2))
                return;
            };
        } catch (ex) { console.error(ex) }
    }
    res.status(400).send("Informe as novas Rules via 'Query Param'. Ex.: ?rules=[\"^/api\", \"/\"]")
})

// Proxy Change
app.use('/',
    createProxyMiddleware({ taget: proxyConfig.target, router: () => proxyConfig.target, pathRewrite: pathRewriteFn })
);

// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});