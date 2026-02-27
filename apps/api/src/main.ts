import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

let app: any

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule)
    app.enableCors({ origin: process.env.FRONTEND_URL || "*" })
    app.setGlobalPrefix("api")
    await app.init()
  }
  return app
}

// Local dev
if (process.env.NODE_ENV !== "production") {
  bootstrap().then((a) => a.listen(3001))
}

// Vercel serverless export
export default async (req: any, res: any) => {
  const server = await bootstrap()
  server.getHttpAdapter().getInstance()(req, res)
}
