export type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  crm: string | null;
  percProfessional: number;
};

export type CreateDoctorDto = {
  firstName: string;
  lastName: string;
  specialtyIds?: string[];
  crm?: string | null;
  percProfessional?: number;
};

export type UpdateDoctorDto = {
  firstName?: string;
  lastName?: string;
  specialtyIds?: string[];
  crm?: string | null;
  percProfessional?: number;
};

export type DoctorResponse = Doctor;

