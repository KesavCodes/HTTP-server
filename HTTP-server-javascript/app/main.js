const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const requestSplit = data?.toString().split("\r\n");
    const statusLine = requestSplit[0];
    if (!statusLine) return;
    const url = statusLine.split(" ")[1];
    if (url === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.startsWith("/echo/")) {
      const echoStr = url.split("/")[2];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:${echoStr.length}\r\n\r\n${echoStr}`
      );
    } else if (url.startsWith("/user-agent")) {
      const userAgent = requestSplit.filter((item) =>
        item.toLowerCase().includes("user-agent:")
      );
      if (!userAgent.length) {
        socket.write("HTTP/1.1 401 BAD REQUEST\r\n\r\n");
      } else {
        const userAgentValue = userAgent[0].split(":")[1]?.trim();
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-length:${userAgentValue.length}\r\n\r\n${userAgentValue}`
        );
      }
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });
  socket.on("close", () => {
    console.log("User is disconnected!");
    socket.end();
  });
});

server.listen(4221, "localhost", () => console.log("Listening on PORT 4221"));
