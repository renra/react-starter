// Initial Checks
const isEnvVarEmpty = function(key) {
  const value = process.env[key];

  if(typeof value === 'undefined' || value == '') {
    console.error(`Missing key: ${key}` )
    return true;
  }

  return false
}

const areAnyEnvVarsMissing = function() {
  // Add your checks here
  //if(
  //  isEnvVarEmpty('VAR_A') ||
  //  isEnvVarEmpty('VAR_B')
  //) {
  //  return true;
  //}

  return false;
}

if(areAnyEnvVarsMissing()) {
  console.error("Please fill in all values in your .env file first.");
  process.exit(1);
}

//

const
  fs = require('fs'),
  http = require('http'),
  port = process.env.PORT;

const readFile = function(path) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, 'utf8', function(err, contents) {
      if(err) {
        reject(err);
      } else {
        resolve(contents);
      }
    })
  });
}

const getIndexBody = function(variables) {
  let outlet_id = 'react_starter'
  let template = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="/src/dist/app.css" />
      </head>

      <body>
        <script src="/src/dist/polyfills.js"></script>
        <script src="/src/dist/app.js"></script>
        <div id="${outlet_id}"></div>

        <script type="text/javascript">
          // Look! I'm client-side JavaScript in server-side JavaScript!
          ReactStarter('${outlet_id}');
        </script>
      </body>
    </html>
  `

  Object.keys(variables).forEach(function(key) {
    template = template.replace(key, variables[key]);
  });

  return template;
};

const getRates = () => {
  return new Promise((resolve, reject) => {
    http.get('http://www.cnb.cz/cs/financni_trhy/devizovy_trh/kurzy_devizoveho_trhu/denni_kurz.txt', (response) => {
      let chunks = [];

      response.on('data', (fragments) => {
        chunks.push(fragments);
      });

      response.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
  });
};

http.createServer(async function (req, res) {
  if(req.url.startsWith('/favicon.ico')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end();
  } else if(req.url == '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // Add variables to replace from process.env if you want
    // TOKEN: process.env.TOKEN,
    res.write(getIndexBody({}));
    res.end();
  } else if(req.url.startsWith('/kurzy')) {
    getRates()
      .then(response => {
        res.writeHead(200, { 'Content-Type': 'text/plain;charset=UTF-8' });
        res.end(response)
      })
      .catch(err => {
        console.error(`Error while fetching rates: ${err}`)
        res.writeHead(404, { 'Content-Type': 'text/plain;charset=UTF-8' });
        res.end('');
      })
  } else {
    let filepath = `.${req.url}`;

    await readFile(filepath)
      .then(function(contents) {
        res.write(contents);
        res.end();
      })
      .catch(function(err) {
        console.log(err);

        res.writeHead(404);
        res.write(err.toString());
        res.end();
      })
  }
}).listen(port);

console.log(`Server listening on port ${port}`);
