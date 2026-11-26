import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('AppointmentStatuses')
export class AppointmentStatus {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updatedAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.status)
  appointments?: Appointment[];
}

@Entity('AppointmentChannels')
export class AppointmentChannel {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'float' })
  percent: number;

  @Column({ type: 'boolean' })
  digital: boolean;
}

@Entity('Appointments')
@Index(['statusId'])
@Index(['clientId'])
@Index(['date'])
@Index(['serviceId'])
@Index(['statusName'])
@Index(['userId'])
export class Appointment {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  date: string;

  @Column({ type: 'text' })
  time: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  service?: string | null;

  @Column({ type: 'text' })
  duration: string;

  @Column({ name: 'status', type: 'text', default: 'Confirmado' })
  statusName: string;

  @Column({ type: 'text' })
  initials: string;

  @Column({ type: 'text' })
  channelId: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'text', nullable: true })
  userId?: string | null;

  @Column({ type: 'text', nullable: true })
  clientId?: string | null;

  @Column({ type: 'text', nullable: true })
  serviceId?: string | null;

  @Column({ type: 'text', nullable: true })
  statusId?: string | null;

  @ManyToOne(() => AppointmentStatus, (status) => status.appointments, {
    nullable: true,
  })
  @JoinColumn({ name: 'statusId' })
  status?: AppointmentStatus | null;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updatedAt: Date;
}
