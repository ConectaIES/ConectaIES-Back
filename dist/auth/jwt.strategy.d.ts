import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User, TipoPerfil } from '../database/entities';
interface JwtPayload {
    email: string;
    sub: number;
    tipoPerfil: TipoPerfil;
}
export interface RequestUser {
    id: number;
    nome: string;
    email: string;
    tipoPerfil: TipoPerfil;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>);
    validate(payload: JwtPayload): Promise<RequestUser>;
}
export {};
