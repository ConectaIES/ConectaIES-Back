import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        senha: string;
    }): Promise<{
        access_token: string;
        user: {
            id: number;
            nome: string;
            email: string;
            tipoPerfil: import("../database/entities").TipoPerfil;
        };
    }>;
    register(body: {
        nome: string;
        email: string;
        senha: string;
        tipoPerfil: string;
    }): Promise<{
        access_token: string;
        user: {
            id: number;
            nome: string;
            email: string;
            tipoPerfil: import("../database/entities").TipoPerfil;
        };
    }>;
}
