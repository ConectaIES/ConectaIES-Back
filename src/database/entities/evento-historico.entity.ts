import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitacao } from './solicitacao.entity';
import { User } from './user.entity';

export enum TipoEvento {
  STATUS_CHANGE = 'STATUS_CHANGE',
  COMMENT = 'COMMENT',
  ATTACHMENT = 'ATTACHMENT',
}

@Entity('event_history')
export class EventoHistorico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'solicitacao_id' })
  solicitacaoId: number;

  @ManyToOne(() => Solicitacao, (solicitacao) => solicitacao.eventos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: Solicitacao;

  @Column({
    type: 'enum',
    enum: TipoEvento,
    name: 'evento_tipo',
  })
  eventoTipo: TipoEvento;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'int', nullable: true, name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => User, (user) => user.eventos, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @CreateDateColumn()
  timestamp: Date;
}
