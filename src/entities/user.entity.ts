import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../users/roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // ✅ FIXED FOR SQLITE
  @Column({
    type: 'text',
    default: Role.USER,
  })
  role!: Role;
}