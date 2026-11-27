import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppointmentsModule } from './cliente/appointments/appointments.module.js';
import { APP_GUARD } from '@nestjs/core';
import { ClientAgendaGuard } from './security/client/client-agenda.guard.js';
import { ClientAgendaRateGuard } from './security/client/client-agenda.rate.guard.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as neonDriver from '@neondatabase/serverless';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL');
        const useNeonDriver = url && new URL(url).hostname.endsWith('.neon.tech');

        return {
          type: 'postgres',
          url,
          ...(useNeonDriver ? { driver: neonDriver } : {}),
          ssl: {
            rejectUnauthorized: true,
            ca: process.env.DATABASE_CA?.replace(/\\n/g, '\n'),
          },
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ClientAgendaGuard },
    { provide: APP_GUARD, useClass: ClientAgendaRateGuard },
  ],
})
export class AppModule {}
