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

  @Column({ type: 'int', name: 'solicitacao_id' })
  solicitacaoId: number;

  @ManyToOne(() => Solicitacao, (solicitacao) => solicitacao.anexos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: Solicitacao;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 100 })
  tipo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
