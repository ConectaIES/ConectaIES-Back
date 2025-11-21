"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const entities_1 = require("./entities");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const dbConfig = {
                        type: 'mssql',
                        host: configService.get('DB_HOST') || 'localhost',
                        port: parseInt(configService.get('DB_PORT') || '1433', 10),
                        username: configService.get('DB_USER') || 'sa',
                        password: configService.get('DB_PASSWORD') || '',
                        database: configService.get('DB_NAME') || 'conecta_ies',
                        entities: [entities_1.User, entities_1.Solicitacao, entities_1.Anexo, entities_1.EventoHistorico],
                        synchronize: true,
                        logging: true,
                        options: {
                            encrypt: false,
                            trustServerCertificate: true,
                        },
                    };
                    console.log('🔧 TypeORM Config:', {
                        type: dbConfig.type,
                        host: dbConfig.host,
                        port: dbConfig.port,
                        database: dbConfig.database,
                        username: dbConfig.username,
                        hasPassword: !!dbConfig.password,
                    });
                    return dbConfig;
                },
                inject: [config_1.ConfigService],
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map