/* eslint-disable no-undef */
let { PythonShell } = require("python-shell");
const express = require("express");
const cors = require("cors");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");
const PORT = 8000;
require("dotenv").config();
const { spawn } = require('node:child_process');

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URL);
const problems = client
  .db(process.env.DB_NAME)
  .collection(process.env.COLLECTION_NAME);

client.connect().then((client) => {
  console.log("Подключение установлено");
  console.log(client.options.dbName);
});

const options = {
  mode: "text",
  pythonOptions: ["-u"],
};

function run(solution, pid = 0) {
  fs.writeFile(`../run_${pid}.py`, solution, (err) => {
    if (err) throw err;
  });
  return new Promise((resolve, reject) => {
    const python = spawn("python3", [`../run_${pid}.py`]);

    let output = ''
    python.stdout.on("data", (data) => {
      output += data.toString()
    });

    setTimeout(() => {
      python.stdout.off("data", data => resolve(data.toString()));
      resolve(["Превышено время ожидания. Возможно, найдены бесконечные процессы."]);
      remove(`../run_${pid}.py`)
      remove(`../run_0.py`)
      python.kill()
    }, 2000);
    let errors = ''
    python.stderr.on("data", (data) => {
      errors += data.toString()
    });

    python.on("close", () => {
      if (errors.length > 0) {
        reject(errors.split('\n'))
        remove(`../run_${pid}.py`)
        remove(`../run_0.py`)
      }
      else if (output.length > 0) {
        resolve(output.split('\n'))
        remove(`../run_${pid}.py`)
        remove(`../run_0.py`)
      }
      else {
        resolve([])
      }
    })

  })
}

function remove(filename) {
  setTimeout(() => {
    fs.unlink(filename, function(err) {
      if(err && err.code == 'ENOENT') {
          console.info("File doesn't exist, won't remove it.");
      } else if (err) {
          console.error("Error occurred while trying to remove file");
      } else {
          console.info(`${filename} removed`);
      }
    });
  }, 1000)
}

app.get('/api', (req, res) => {
  const path = `/api/item/${v4()}`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get("/problems", async (req, res) => {
  let result = await problems.find({}).toArray();
  res.send(result);
});

app.get("/problem_info/:pid", async (req, res) => {
  let result = await problems.findOne({ pid: req.params.pid });
  res.send(result);
});

app.post('/run', async (req, res) => {
  await run(req.body.code)
  .then(results => {
    res.send(results)
  })
  .catch(err => {
    res.send(err)
  });

})

app.post("/test/:pid", (req, res) => {
  run(req.body.code, req.params.pid)
  .then(async () => {
      const problem = await problems.findOne({ pid: req.params.pid });
      const test_cases = problem["test_cases"];

      let test_file =
        `from run_${req.params.pid} import solution\n`
      for (const test of test_cases) {
        test_file += 'print(' + test + ')\n'
      }
      fs.writeFile(`../tests_${req.params.pid}.py`, test_file, (err) => {
        if (err) throw err;
      });
      PythonShell.run(`../tests_${req.params.pid}.py`, options).then(function (result) {
        let passing = true
        result.forEach((element) => {
          if (element !== "True") {
            passing = false
          }
        });
        res.send(passing)

    })
    .catch(function (err) {
      res.send(err)
    });
  }).then(() => {
    remove(`../tests_${req.params.pid}.py`)
  })
  .catch(function (err) {
    res.send(err);
  });


});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
