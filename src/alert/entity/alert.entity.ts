import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dollar: number;

  @Column()
  chain: string;

  @Column()
  email: string;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
