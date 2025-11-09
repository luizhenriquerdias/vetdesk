export type Specialty = {
  id: string;
  name: string;
  appointmentFee: number;
  percProfessional: number;
};

export type CreateSpecialtyDto = {
  name: string;
  appointmentFee: number;
  percProfessional: number;
};

export type UpdateSpecialtyDto = {
  appointmentFee?: number;
  percProfessional?: number;
};

export type SpecialtyResponse = Specialty;

