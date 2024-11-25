const net = require("net");

const server = net.createServer((socket) => {
  console.log("User connected!");
  socket.on("data", (data) => {
    console.log(data.toString());
    socket.write(`Echo: ${data}`);
  });
  socket.on("error", (err) => console.log(err.message));
  socket.on("close", () => {
    console.log("User disconnected!");
  });
});

server.listen(8080, () => console.log("Listening on PORT 8080."));
