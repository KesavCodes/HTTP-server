const net = require("net");
const fs = require("fs");
const path = require("path");

const supportedCompressions = ["gzip"];

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
      const compressionHeader = requestSplit.filter((item) =>
        item.toLowerCase().includes("accept-encoding:")
      );
      const compressData =
        compressionHeader.length &&
        supportedCompressions.includes(compressionHeader[0].split(":")[1].trim());

      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n${
          compressData ? "Content-Encoding: gzip\r\n" : ""
        }Content-Length:${echoStr.length}\r\n\r\n${echoStr}`
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
    } else if (url.startsWith("/files/")) {
      const fileName = url.split("/")[2];
      try {
        const fileData = fs.readFileSync(
          path.join(__dirname, "..", "public", fileName)
        );
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length:${fileData.byteLength}\r\n\r\n${fileData}`
        );
      } catch (err) {
        if (err?.code === "ENOENT") {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        } else {
          socket.write("HTTP/1.1 500 Server Issue\r\n\r\n");
        }
      }
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });
  socket.on("close", () => {
    console.log("User is disconnected!");
    socket.end();
  });
});

server.listen(4221, "localhost", () => console.log("Listening on PORT 4221"));
