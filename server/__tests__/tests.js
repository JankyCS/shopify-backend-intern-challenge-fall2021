const app = require("../index"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const databaseName = "test1";
const User = require("../model/User");
const Image = require("../model/Image");

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${databaseName}`;
  await mongoose.connect(url, { useNewUrlParser: true });
});

it("Should register user, try login with wrong password, and try login with nonexistent user", async done => {
  const res = await request.post("/user/register").send({
    username: "testuser1",
    password: "abcd1234!"
  });

  const user = await User.findOne({ username: "testuser1" });
  expect(user.password).toBeTruthy();

  const res2 = await request.post("/user/login").send({
    username: "testuser1",
    password: "wrongPass!"
  });

  expect(res2.body.error).toBe("Incorrect Password");

  const res3 = await request.post("/user/login").send({
    username: "fakeUser",
    password: "wrongPass!"
  });

  expect(res3.body.error).toBe('Username not found');
  console.log(res3.body)

  done();
});


it("Should register user to database, Then login", async done => {
  const res = await request.post("/user/register").send({
    username: "testuser1",
    password: "abcd1234!"
  });

  const user = await User.findOne({ username: "testuser1" });
  expect(user.password).toBeTruthy();

  const res2 = await request.post("/user/login").send({
    username: "testuser1",
    password: "abcd1234!"
  });

  expect(res2.body.success).toBeTruthy();
  expect(res2.body.token).toBeTruthy();

  done();
});

it("Should register user, login, upload an image, and delete it", async done => {
  const res = await request.post("/user/register").send({
    username: "testuser1",
    password: "abcd1234!"
  });

  const user = await User.findOne({ username: "testuser1" });
  expect(user.password).toBeTruthy();

  const res2 = await request.post("/user/login").send({
    username: "testuser1",
    password: "abcd1234!"
  });

  expect(res2.body.success).toBeTruthy();
  expect(res2.body.token).toBeTruthy();

  const bearer = "Bearer "+res2.body.token

  const res3 = await request.post("/image/uploadOne").attach('photo', '__tests__/testImages/shampoo.jpg').set('Authorization', bearer);
  expect(res3.body.success).toBeTruthy();
  expect(res3.body.filename).toBeTruthy();

  const res8 = await request.post("/image/viewAll")
  expect(res8.body.success).toBeTruthy();
  expect(res8.body.images.length).toBe(1);

  const res4 = await request.post("/image/deleteAll").set('Authorization', bearer);
  expect(res4.body.success).toBeTruthy();

  const res9 = await request.post("/image/viewAll")
  expect(res9.body.success).toBeTruthy();
  expect(res9.body.images.length).toBe(0);

  done();
});

it("Create two users and have second fail to delete the firsts image", async done => {
  let res = await request.post("/user/register").send({
    username: "testuser1",
    password: "abcd1234!"
  });

  let user = await User.findOne({ username: "testuser1" });
  expect(user.password).toBeTruthy();
  
  res = await request.post("/user/register").send({
    username: "testuser2",
    password: "abcdefg"
  });

  user = await User.findOne({ username: "testuser2" });
  expect(user.password).toBeTruthy();
  

  const res2 = await request.post("/user/login").send({
    username: "testuser1",
    password: "abcd1234!"
  });

  expect(res2.body.success).toBeTruthy();
  expect(res2.body.token).toBeTruthy();

  const bearer = "Bearer "+res2.body.token

  const res5 = await request.post("/user/login").send({
    username: "testuser2",
    password: "abcdefg"
  });

  expect(res5.body.success).toBeTruthy();
  expect(res5.body.token).toBeTruthy();
  const bearer2 = "Bearer "+res5.body.token


  const res3 = await request.post("/image/uploadOne").attach('photo', '__tests__/testImages/shampoo.jpg').set('Authorization', bearer);
  expect(res3.body.success).toBeTruthy();
  expect(res3.body.filename).toBeTruthy();

  const filename = res3.body.filename
  
  res = await request.post("/image/delete").set('Authorization', bearer2).send({
    filenames: [filename]
  });

  expect(res.body.error).toBe("User Not Authorized To Delete (Must be the author)");

  const res4 = await request.post("/image/deleteAll").set('Authorization', bearer);
  expect(res4.body.success).toBeTruthy();

  done();
});

// Cleans up database between each test
afterEach(async () => {
  await User.deleteMany();
  await Image.deleteMany();
  // await mongoose.connection.close();
});

afterAll(async () => {
  await mongoose.connection.close();
});