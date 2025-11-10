export type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string | null;
  crm: string | null;
  percProfessional: number;
  appointmentFee: number;
};

export type CreateDoctorDto = {
  firstName: string;
  lastName: string;
  specialtyId?: string | null;
  crm?: string | null;
  percProfessional?: number;
  appointmentFee?: number;
};

export type UpdateDoctorDto = {
  firstName?: string;
  lastName?: string;
  specialtyId?: string | null;
  crm?: string | null;
  percProfessional?: number;
  appointmentFee?: number;
};

export type DoctorResponse = Doctor;

