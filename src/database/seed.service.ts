import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, TipoPerfil } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createAdminUser();
  }

  private async createAdminUser() {
    try {
      const adminEmail = 'admin@conectaies.com';
      
      // Verificar se já existe
      const existingAdmin = await this.userRepository.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        console.log('✅ Usuário admin já existe');
        return;
      }

      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      const admin = this.userRepository.create({
        nome: 'Administrador',
        email: adminEmail,
        senhaHash: hashedPassword,
        tipoPerfil: TipoPerfil.ADMIN,
        matricula: undefined,
      });

      await this.userRepository.save(admin);
      
      console.log('🎉 Usuário admin criado com sucesso!');
      console.log('📧 Email: admin@conectaies.com');
      console.log('🔑 Senha: Admin@123');
    } catch (error) {
      console.error('❌ Erro ao criar admin:', error.message);
    }
  }
}
