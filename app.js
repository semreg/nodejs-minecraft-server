const spawn = require('child_process').spawn

const minecraftServerProcess = spawn('java', [
  '-Xmx1024M',
  '-Xms1024M',
  '-jar',
  'server.jar',
  'nogui'
])

const log = data => process.stdout.write(data.toString())

minecraftServerProcess.stdout.on('data', log)
minecraftServerProcess.stderr.on('data', log)

const app = require('express')()

app.use(require('body-parser').urlencoded({
  extended: false
}))

// Create a route that will respond to a POST request
app.post('/command', (req, res) => {
  // Get the command from the HTTP request and send it to the Minecraft
  // server process
  const command = req.param('Body')

  minecraftServerProcess.stdin.write(command + '\n')

  // buffer output for a quarter of a second, then reply to HTTP request
  let buffer = []

  const collector = (data) => {
    data = data.toString()
    buffer.push(data.split(']: ')[1])
  }

  minecraftServerProcess.stdout.on('data', collector)

  setTimeout(() => {
    minecraftServerProcess.stdout.removeListener('data', collector)

    res.send(buffer.join(''))
  }, 250)
})

// Listen for incoming HTTP requests on port 3000
app.listen(3000)
