const express = require("express");
const cors = require("cors");
const { randomUUID: uuid } = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username == username);

  if (!user) {
    return res.status(404).json({ error: "Username not found!" });
  }

  req.user = user;

  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.some((user) => user.username == username);

  if (userAlreadyExists) {
    return res.status(400).json({ error: "The username is already in use!" });
  }

  const newUser = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return res.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  if (!title || !deadline) {
    return res
      .status(400)
      .json({ error: "No title or deadline, please insert both" });
  }

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = user.todos.find((todo) => todo.id == id);

  if (!todo) {
    return res.status(404).json({ error: "Todo ID not found!" });
  }

  todo.title = title ? title : todo.title;
  todo.deadline = deadline ? new Date(deadline) : todo.deadline;

  return res.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const todo = user.todos.find((todo) => todo.id == id);

  if (!todo) {
    return res.status(404).json({ error: "Todo ID not found!" });
  }

  todo.done = true;

  return res.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const todo = user.todos.find((todo) => todo.id == id);

  if (!todo) {
    return res.status(404).json({ error: "Todo ID not found!" });
  }

  user.todos.splice(user.todos.indexOf(todo), 1);

  return res.status(204).end();
});

module.exports = app;
