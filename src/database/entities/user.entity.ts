import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Solicitacao } from './solicitacao.entity';
import { EventoHistorico } from './evento-historico.entity';

export enum TipoPerfil {
  ALUNO = 'ALUNO',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nome: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'senha_hash' })
  senhaHash: string;

  @Column({
    type: 'enum',
    enum: TipoPerfil,
    name: 'tipo_perfil',
  })
  tipoPerfil: TipoPerfil;

  @Column({ type: 'varchar', length: 50, nullable: true })
  matricula: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Solicitacao, (solicitacao) => solicitacao.usuario)
  solicitacoes: Solicitacao[];

  @OneToMany(() => EventoHistorico, (evento) => evento.usuario)
  eventos: EventoHistorico[];
}
