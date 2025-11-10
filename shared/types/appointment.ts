export type Appointment = {
  id: string;
  doctorId: string;
  fee: number;
  percProfessional: number;
  datetime: string;
};

export type CreateAppointmentDto = {
  doctorId: string;
  fee: number;
  percProfessional?: number;
  datetime: string;
};

export type UpdateAppointmentDto = {
  doctorId?: string;
  fee?: number;
  percProfessional?: number;
  datetime?: string;
};

export type AppointmentResponse = Appointment;

