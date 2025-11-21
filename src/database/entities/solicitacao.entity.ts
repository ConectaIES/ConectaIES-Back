import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Anexo } from './anexo.entity';
import { EventoHistorico } from './evento-historico.entity';

export enum TipoSolicitacao {
  APOIO_LOCOMOCAO = 'APOIO_LOCOMOCAO',
  INTERPRETACAO_LIBRAS = 'INTERPRETACAO_LIBRAS',
  OUTROS = 'OUTROS',
}

export enum StatusSolicitacao {
  ABERTO = 'ABERTO',
  NAO_VISTO = 'NAO_VISTO',
  EM_ANALISE = 'EM_ANALISE',
  EM_EXECUCAO = 'EM_EXECUCAO',
  RESOLVIDO = 'RESOLVIDO',
}

@Entity('solicitations')
export class Solicitacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  protocolo: string;

  @Column({ length: 200 })
  titulo: string;

  @Column('text')
  descricao: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  tipo: TipoSolicitacao;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'ABERTO',
  })
  status: StatusSolicitacao;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => User, (user) => user.solicitacoes)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'first_response_at' })
  firstResponseAt: Date;

  @OneToMany(() => Anexo, (anexo) => anexo.solicitacao, { cascade: true })
  anexos: Anexo[];

  @OneToMany(() => EventoHistorico, (evento) => evento.solicitacao, {
    cascade: true,
  })
  eventos: EventoHistorico[];

  // Campo virtual para calcular tempo restante até violar TMR
  timeToTmrBreach?: number;
}
