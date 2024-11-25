const net = require("net");

const client = new net.Socket();

client.connect(8080, "localhost", () =>
  console.log("Connected to server at PORT 8080!")
);

client.on("data", (data) => console.log(data.toString()));

client.write("Hello World");
