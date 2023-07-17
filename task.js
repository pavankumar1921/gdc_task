// console.log("Hello, World!");
const fs = require("fs");
const path = require("path");

const taskFile = path.resolve(process.cwd(), "task.txt");
const completedFile = path.resolve(process.cwd(), "completed.txt");

const addTask = (priority, task) => {
  const data = `${priority} ${task}\n`;
  fs.appendFileSync(taskFile, data, "utf8");
  return `Added task: "${task}" with priority ${priority}`;
};

const getTasks = () => {
  const taskLines = fs.readFileSync(taskFile, "utf8").trim().split("\n");
  const tasks = taskLines.map((line) => {
    const [priority, ...taskParts] = line.split(" ");
    const task = taskParts.join(" ").trim();
    return { priority: Number(priority), task };
  });
  tasks.sort((a, b) => a.priority - b.priority);
  return tasks;
};

const listAllTasks = () => {
  const tasks = getTasks();
  if (tasks.length === 0) {
    console.log("There are no pending tasks!");
  } else {
    let count = 0;
    tasks.forEach((task) => {
      if (task.priority > 0 && task.task.trim() !== "") {
        count++;
        console.log(`${count}. ${task.task} [${task.priority}]`);
      }
    });
    if (count === 0) {
      console.log("There are no pending tasks!");
    }
  }
  return "";
};

const deleteTask = (index) => {
  const tasks = getTasks();
  if (tasks.length === 0) {
    return "Error: The task list is empty. Nothing deleted.";
  }
  if (index >= 0 && index < tasks.length) {
    const deletedTask = tasks.splice(index, 1)[0];
    fs.writeFileSync(
      taskFile,
      tasks.map((t) => `${t.priority} ${t.task}`).join("\n") + "\n",
      "utf8"
    );
    return `Deleted task #${deletedTask.priority}`;
  } else {
    return `Error: task with index #${
      index + 1
    } does not exist. Nothing deleted.`;
  }
};

const markTaskAsDone = (index) => {
  const tasks = getTasks();
  if (index >= 1 && index <= tasks.length) {
    const completedTask = tasks.splice(index - 1, 1)[0];
    fs.writeFileSync(
      taskFile,
      tasks.map((t) => `${t.priority} ${t.task}`).join("\n") + "\n",
      "utf8"
    );
    fs.appendFileSync(completedFile, `${completedTask.task}\n`, "utf8");

    return "Marked item as done.";
  } else {
    return `Error: no incomplete item with index #${index} exists.`;
  }
};

const report = () => {
  const tasks = getTasks();
  let completedTasks = [];
  try {
    completedTasks = fs.readFileSync(completedFile, "utf8").trim().split("\n");
  } catch (err) {
    completedTasks = [];
  }

  const incompleteTasks = tasks.filter((task) => !task.done);
  const completeTasks = tasks.filter((task) => task.done);

  console.log(`Pending : ${incompleteTasks.length}`);
  incompleteTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.task} [${task.priority}]`);
  });

  console.log(`\nCompleted : ${completedTasks.length}`);
  completedTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
  return '';
};

const usage = `Usage :-
$ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list
$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
$ ./task del INDEX            # Delete the incomplete item with the given index
$ ./task done INDEX           # Mark the incomplete item with the given index as complete
$ ./task help                 # Show usage
$ ./task report               # Statistics`;

const tasksTxtCli = () => {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  const index = Number(args[0]);

  if (!command) {
    return usage;
  }
  switch (command) {
    case "add":
      const [priority, ...taskParts] = args;
      const task = taskParts.join(" ");
      if (priority && task) {
        return addTask(priority, task);
      } else {
        return "Error: Missing tasks string. Nothing added!";
      }
      break;
    case "ls":
      return listAllTasks();
      break;
    case "del":
      if (isNaN(index)) {
        return "Error: Missing NUMBER for deleting tasks.";
      } else {
        return deleteTask(index - 1);
      }
    case "done":
      if (isNaN(index)) {
        return "Error: Missing NUMBER for marking tasks as done.";
      } else {
        return markTaskAsDone(index);
      }
    case "report":
      return report();
    case "help":
      return usage;
      break;
    default:
        return "Invalid command"
  }
};

const result = tasksTxtCli();
console.log(result);
module.exports = tasksTxtCli;
