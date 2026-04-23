import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Claim {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemId: number;

  @Column()
  userId: number;

  @Column()
  message: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';
}