import {readFile, readdir} from 'fs';
import fs from 'fs';
import path from 'path';

/**
 * An Task Object
 */

const taskList = [];
const readingPath = './saved-tasks';

class Task {
  /**
   * @param {Object} task, with appropriate fields of a task
   */
  constructor(task) {
    this.title = task.title;
    this.description = task.description;
    this.priority = task.priority;
    this.duedate = this.formatDate(new Date(task['due-date'] || task.duedate));
    this.pinned = task.pinned;
    this.tags = task.tags;
    this.progress = task.progress;
  }

  /**
   * TODO: this function tests if the Task has the given tag
   * @param {String} tag, the given single tag to be checked
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }

  /**
   * this function convert a Date Object to a "yyyy-mm-dd" format string
   * @param {Date} date
   * @return {String} "yyyy-mm-dd" format string
   */
  formatDate(date) {
    const year = date.getFullYear();
    // Adding 1 because getMonth() is zero-based
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export async function loadTasks() {
  const files = await fs.promises.readdir(readingPath);
  for (let file of files) {
      const content = await fs.promises.readFile(path.join(readingPath, file), 'utf8');
      const taskData = JSON.parse(content);
      const task = new Task(taskData);
      /*const task = new Task(
          taskData.title,
          taskData.description,
          taskData.priority,
          taskData.dueDate,
          taskData.pinned,
          taskData.tags,
          taskData.progress
      );*/
      taskList.push(task);
  }
}

await loadTasks();

export {
  Task, taskList
};
