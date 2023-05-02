"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getCurrentCount() {
    let currentCount = await prisma.counter.findFirst();
    if (!currentCount) {
        currentCount = await prisma.counter.create({
            data: { count: 0 },
        });
    }
    return currentCount;
}
const fastify = (0, fastify_1.default)({ logger: true });
fastify.register(require("@fastify/formbody"));
fastify.post("/", async (req, res) => {
    const params = req.body;
    const intent = params.intent;
    const currentCount = await getCurrentCount();
    if (intent !== "increment") {
        return res.send("invalid intent");
    }
    await prisma.counter.update({
        where: { id: currentCount.id },
        data: { count: { [intent]: 1 } },
    });
    res.code(302);
    res.redirect("/");
});
fastify.get("/", async (req, res) => {
    let currentCount = await getCurrentCount();
    res.header("Content-Type", "text/html");
    res.code(302);
    res.send(`
    <html>
      <head>
        <title>click me 🌎</title>
      </head>
      <body>
        <h1>click me</h1>
        <form method="POST">
          <button type="submit" name="intent" value="increment">🌎</button>
          <span>current count: ${currentCount}</span>
        </form>
      </body>
    </html>
  `);
});
const start = async () => {
    try {
        fastify.listen((address) => {
            const url = typeof address === "string" ? address : `http://localhost:8080`;
            console.log(`server listening on ${url}`);
        });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
