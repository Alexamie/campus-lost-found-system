import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ type: 'simple-enum', enum: ['lost', 'found'] })
  status: 'lost' | 'found';

  @Column({
    type: 'simple-enum',
    enum: ['pending', 'approved'],
    default: 'pending',
  })
  approvalStatus: 'pending' | 'approved';

  @Column({ nullable: true })
  reportedByUserId: number;
}
