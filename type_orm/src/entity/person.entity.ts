import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// 중복되는 프로퍼티 막아줄 수 있다.
export class Name {
  @Column()
  first: string;

  @Column()
  last: string;
}

@Entity()
export class StudentModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column(() => Name)
  name: Name;

  @Column()
  class: string;
}

@Entity()
export class TeacherModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column(() => Name)
  name: Name;

  @Column()
  class: string;
  @Column()
  salary: number;
}
