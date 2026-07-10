import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  //query in filteration at products sent as price[gte]=100 and dont turn into {price:{gte:100}} 
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended');
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
