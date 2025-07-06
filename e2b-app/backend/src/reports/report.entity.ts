import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  xmlContent: string;

  @Column()
  encryptionKey: string;

  @Column()
  filename: string;

  @Column({ type: 'json' })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.reports)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}