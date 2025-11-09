export type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  crm: string | null;
};

export type CreateDoctorDto = {
  firstName: string;
  lastName: string;
  specialty: string;
  crm?: string | null;
};

export type UpdateDoctorDto = {
  firstName?: string;
  lastName?: string;
  specialty?: string;
  crm?: string | null;
};

export type DoctorResponse = Doctor;

