import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../database/entities';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
}
