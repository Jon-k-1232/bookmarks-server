const express = require('express');
const uuid = require('uuid/v4');
const { isWebUri } = require('valid-url');
const log = require('../log');
const store = require('../store');



const bookmarksRouter = express.Router();
const bodyParser = express.json();



bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(store.bookmarks)
    })
    .post(bodyParser, (req, res) => {
        for (const field of ['title', 'url', 'rating']) {
            if (!req.body[field]) {
                log.error(`${field} is required`);
                return res.status(400).send(`'${field}' is required`)
            }
        }
        const { title, url, description, rating } = req.body;

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            log.error(`Invalid rating '${rating}' supplied`);
            return res.status(400).send(`rating must be a number between 0 and 5`)
        }

        if (!isWebUri(url)) {
            log.error(`Invalid url '${url}'`);
            return res.status(400).send(`'url' must be a valid URL`)
        }

        const bookmark = { id: uuid(), title, url, description, rating };

        store.bookmarks.push(bookmark);

        log.info(`Bookmark with id ${bookmark.id} created`);
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
            .json(bookmark)
    });



bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .get((req, res) => {
        const { bookmark_id } = req.params;

        const bookmark = store.bookmarks.find(c => c.id == bookmark_id);

        if (!bookmark) {
            log.error(`Bookmark with id ${bookmark_id} not found.`);
            return res
                .status(404)
                .send('Bookmark Not Found')
        }

        res.json(bookmark)
    })
    .delete((req, res) => {
        const { bookmark_id } = req.params;

        const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id);

        if (bookmarkIndex === -1) {
            log.error(`Bookmark with id ${bookmark_id} not found.`);
            return res
                .status(404)
                .send('Bookmark Not Found')
        }

        store.bookmarks.splice(bookmarkIndex, 1);

        log.info(`Bookmark with id ${bookmark_id} deleted.`);
        res
            .status(204)
            .end()
    });

module.exports = bookmarksRouter;