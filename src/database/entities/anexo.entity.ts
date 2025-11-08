import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitacao } from './solicitacao.entity';

@Entity('attachments')
export class Anexo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'solicitacao_id' })
  solicitacaoId: number;

  @ManyToOne(() => Solicitacao, (solicitacao) => solicitacao.anexos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: Solicitacao;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 100 })
  tipo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
