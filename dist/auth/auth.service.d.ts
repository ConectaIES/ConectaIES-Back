import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../database/entities';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    login(email: string, senha: string): Promise<{
        access_token: string;
        user: {
            id: number;
            nome: string;
            email: string;
            tipoPerfil: import("../database/entities").TipoPerfil;
        };
    }>;
    register(nome: string, email: string, senha: string, tipoPerfil: string): Promise<{
        access_token: string;
        user: {
            id: number;
            nome: string;
            email: string;
            tipoPerfil: import("../database/entities").TipoPerfil;
        };
    }>;
}
