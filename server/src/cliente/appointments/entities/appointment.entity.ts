import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
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

  @OneToOne(() => AppointmentReview, (review) => review.appointment)
  review?: AppointmentReview | null;
}

@Entity('AppointmentReviews')
@Index(['appointmentId'], { unique: true })
export class AppointmentReview {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  appointmentId: string;

  @Column({ type: 'text' })
  clientId: string;

  @Column({ type: 'text' })
  attendantId: string;

  @Column({ type: 'int', nullable: true })
  rating?: number | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  reviewedAt?: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  dismissedAt?: Date | null;

  @OneToOne(() => Appointment, (appointment) => appointment.review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updatedAt: Date;
}
