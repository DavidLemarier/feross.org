const bodyParser = require('body-parser')
const express = require('express')
const mysql = require('mysql')
const secret = require('./secret')

const query = {
  insert: 'INSERT INTO views (slug, views) VALUES (?, ?)',
  select: 'SELECT views FROM views WHERE slug = ?',
  sum: 'SELECT sum(views) AS views FROM views',
  update: 'UPDATE views SET views=views+1 WHERE slug = ?'
}

let port = process.argv[2] || 3000
console.log(`Using port ${port}`)

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const createConnection = () => {
  // Set up a connection for each request
  const connection = mysql.createConnection(secret.db)

  // If there's an error, just print it out. Views aren't that important.
  connection.connect(err => {
    if (err) {
      console.error('Database error: Cannot connect.', err.message)
    }
  })

  connection.on('error', err => {
    console.error('Database error: Well, this was really random.', err.message)
  })

  return connection
}

// Increment the view count for a particular post and return
// the current view count.
app.post('/views', (req, res) => {
  const slug = req.param('slug')

  if (!slug) {
    return res.send('Error: Missing `slug` param')
  }

  // Init connection (only if we have the slug)
  const connection = createConnection()

  // Get view count and send it
  connection.query(query.select, [slug], (err, results) => {
    if (err) {
      console.error(err.message)
      res.send({ err: 'Error: db error while getting view count' })
    } else if (results.length === 0) {
      res.send({ err: 'Error: slug not found' })
    } else {
      res.send(results[0])
    }

    // Asyncronously update the view count
    connection.query(query.update, [slug], (err, results) => {
      if (err) {
        console.error(err.message)
        connection.end()
      } else if (results.affectedRows === 0) {
       // If no rows were affected, then this is a new post, so add it
        connection.query(query.insert, [slug, 1], (err, results) => {
          if (err) {
            console.error(err.message)
          } else if (results.affectedRows !== 1) {
            console.error('ERROR: Inserting new slug failed')
          } else {
            console.log(`Added new slug ${slug}`)
          }

          connection.end()
        })
      } else {
        connection.end()
      }
    })
  })
})

// Get the total view count for all posts
app.get('/views/total', (req, res) => {
  const connection = createConnection()
  connection.query(query.sum, (err, results) => {
    if (err) {
      res.send({ err: 'Error: db error while getting total view count' })
    } else if (results.length > 0) {
      res.send(results[0])
    } else {
      res.send({ err: 'Error: slug not found' })
    }

    connection.end()
  })
})

// Start server
app.listen(port)
