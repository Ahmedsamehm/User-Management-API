import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  @IsEmail()
  email: string;

  @Exclude()
  @Column({ length: 255, nullable: false })
  password: string;
}
