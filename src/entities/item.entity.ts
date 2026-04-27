import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  location: string;

  @Column()
  contact: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 'lost' })
  status: string;

  @Column({ default: 'pending' })
  approvalStatus: string;

  @Column({ nullable: true })
  reportedByUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
