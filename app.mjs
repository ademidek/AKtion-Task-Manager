// app.mjs
import express from 'express';
import {resolve, dirname} from 'path';
import {readFile, readdir} from 'fs';
import {fileURLToPath} from 'url';
import * as path from 'path';
import {Task, loadTasks, taskList} from './task.mjs';
import url from 'url';
import bodyParser from 'body-parser';

const app = express();
// set hbs engine
app.set('view engine', 'hbs');

// TODO: use middleware to serve static files from public
// make sure to calculate the absolute path to the directory
// with import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicPath = path.resolve(__dirname, "public");

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// TODO: use middleware required for reading bodys
app.use((req, res, next) => {
  console.log("Method: " + req.method);
  console.log("Path: " + req.path);
  console.log("Query: " + JSON.stringify(req.query));
  console.log("Body: ", JSON.stringify(req.body));
  console.log("");
  next();
});

// The global list to store all tasks to be rendered
//let taskList = [];

// The reading path
const readingPath = path.resolve(__dirname, './saved-tasks');

/**
 * This function sort tasks by the give criteria "sort-by" and "sort-order"
 * @param {Request} req query should contain "sort-by" and "sort-order"
 * @param {[Task]} l the array of tasks to be sorted
 * @return {[Task]} sorted array of tasks by the given criteria
 */
function sortTasks(req, l) {
  if (req.query['sort-by'] && req.query['sort-order']) {
    const newL = [...l];
    const crit = req.query['sort-by'];
    const ord = req.query['sort-order'];

    newL.sort((a, b)=>{
      if (a.pinned && !b.pinned) {
        return -1;
      } else if (!a.pinned && b.pinned) {
        return 1;
      }
      if (ord === 'asc') {
        switch (crit) {
          case 'due-date': {
            const a1 = new Date(a[crit]).getTime();
            const b1 = new Date(b[crit]).getTime();
            if (a1 === b1) { 
              return 0;
             }else{
              return a1 - b1;
            }
          }
          case 'priority': {
            return a[crit] - b[crit];
          }
          default: {
            return 0;
          }
        }
      } else if (ord === 'desc') {
        switch (crit) {
          case 'due-date': {
            const a1 = new Date(a[crit]).getTime();
            const b1 = new Date(b[crit]).getTime();
            if (b1 === a1) { 
              return 0; 
            }else{
              return b1 - a1;
            }
          }
          case 'priority': {
            return b[crit] - a[crit];
          }
          default: {
            return 0;
          }
        }
      } else {
        return [];
      }
    });
    return newL;
  } else {
    return l;
  }
}

/**
 * This function sort tasks by whether they are pinned or not
 * @param {[Task]} l the array of tasks to be sorted
 * @return {[Task]} sorted array of tasks, with pinned tasks first
 */
function pinnedTasks(l) {
  return [...l].sort((a, b)=>b.pinned-a.pinned);
}

app.get('/', (req, res) => {
  console.log("App is working");
  let filteredTasks = [...taskList];

  if (req.query.titleQ) {
    const titleQuery = req.query.titleQ.toLowerCase();
    filteredTasks = filteredTasks.filter(task => task.title.toLowerCase().includes(titleQuery));
  }

  if (req.query.tagQ) {
    const tagQuery = req.query.tagQ.toLowerCase();

    filteredTasks = filteredTasks.filter(task => {
        if (!task.tags){ 
          return false; 
        }
        return task.tags.some(tag => tag.toLowerCase() === tagQuery);
    });
  }

  let sortedTasks = sortTasks(req, filteredTasks);
  res.render('home', { tasks: sortedTasks });
});

app.get('/add', (req, res) => {
  res.render('add-task');
});

app.post('/add', (req, res) => {
  const newTask = {
      title: req.body.title,
      description: req.body.description,
      priority: parseInt(req.body.priority),
      duedate: req.body["due-date"],
      pinned: req.body.pinned === "yes",
      tags: req.body.tags.split(", ").filter(tag => tag.trim() !== ""),
      progress: req.body.progress
  };

  if (newTask.pinned) {
      taskList.unshift(newTask);
  } else {
      taskList.push(newTask);
  }

  res.redirect('/');
});

await loadTasks();

app.listen(3000, () => {
  console.log("Server is active")
}); 
