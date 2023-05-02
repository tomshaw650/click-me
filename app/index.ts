import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getCurrentCount() {
  let currentCount = await prisma.counter.findFirst();
  if (!currentCount) {
    currentCount = await prisma.counter.create({
      data: { count: 0 },
    });
  }
  return currentCount;
}

const fastify = Fastify({ logger: true });
fastify.register(require("@fastify/formbody"));

fastify.post("/", async (req, res) => {
  const params = req.body as { intent: string };
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
        <title>click me!</title>
      </head>
      <body>
        <h1>click me</h1>
        <form method="POST">
          <button type="submit" name="intent" value="increment">click</button>
          <span>current count: ${currentCount.count}</span>
        </form>
      </body>
    </html>
  `);
});

const start = async () => {
  try {
    fastify.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
